// app/api/employeemanagement/employees/CREATE.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/lib/utils/sendEmail";
import { employeeSchema } from "./types";
import { parseJsonInput } from "./utils";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { generateUniqueUsername } from "@/lib/utils/generateUsername";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: ["error"], // Only log errors regardless of environment
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

async function createEmployeeWithAccount(employeeData: any, accountData: any) {
  const { employee, credentials } = accountData;
  const {
    schedules,
    job_id,
    department_id,
    educational_bg_json,
    family_bg_json,
    ...rest
  } = employeeData;

  return await prisma.$transaction(
    async (tx) => {
      try {
        // Generate unique username
        const username = await generateUniqueUsername(employee.email);

        // Check if email exists
        const existingUser = await tx.trans_users.findFirst({
          where: { email: employee.email }
        });

        if (existingUser) {
          throw new Error("Email already exists");
        }

        const newUser = await tx.trans_users.create({
          data: {
            name: employee.first_name,
            email: employee.email,
            auth_credentials: {
              create: {
                username: username,
                password: await new SimpleAES().encryptData("password"),
              },
            },
          },
        });

        const parseDates = (dateString: string | null) => {
          if (!dateString) return null;
          const date = new Date(dateString);
          return toGMT8(date)
            .hour(12)
            .minute(0)
            .second(0)
            .millisecond(0)
            .toDate();
        };

        const educationalBackground = parseJsonInput(educational_bg_json);
        const familyBackground = parseJsonInput(family_bg_json);

        const newEmployee = await tx.trans_employees.create({
          data: {
            ...rest,
            branch_id: Number(rest.branch_id),
            employement_status_id: Number(rest.employement_status_id),
            hired_at: rest.hired_at ? parseDates(rest.hired_at) : null,
            birthdate: rest.birthdate ? parseDates(rest.birthdate) : null,
            suspension_json: [],
            resignation_json: [],
            termination_json: [],
            educational_bg_json: educationalBackground,
            family_bg_json: familyBackground,
            created_at: toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
          },
        });

        await tx.acl_user_access_control.create({
          data: {
            employee_id: newEmployee.id,
            user_id: newUser.id,
            privilege_id: Number(credentials.privilege_id),
            created_at: new Date(),
          },
        });

        if (job_id) {
          await tx.trans_employees.update({
            where: { id: newEmployee.id },
            data: { ref_job_classes: { connect: { id: Number(job_id) } } },
          });
        }

        if (department_id) {
          await tx.trans_employees.update({
            where: { id: newEmployee.id },
            data: {
              ref_departments: { connect: { id: Number(department_id) } },
            },
          });
        }

        // Step 5: Create schedules if provided
        if (Array.isArray(schedules) && schedules.length > 0) {
          const currentDate = new Date();
          
          // First, fetch the complete batch schedule details
          const batchSchedule = await tx.ref_batch_schedules.findUnique({
            where: {
              id: Number(schedules[0].batch_id),
              deleted_at: null
            }
          });
        
          // Create schedule with batch schedule details
          await tx.dim_schedules.create({
            data: {
              employee_id: newEmployee.id,
              batch_id: Number(schedules[0].batch_id),
              days_json: schedules[0].days_json,
              created_at: currentDate,
              updated_at: currentDate,
              start_date: currentDate,
              end_date: null,
              // Include time details from batch schedule
              clock_in: batchSchedule?.clock_in || null,
              clock_out: batchSchedule?.clock_out || null,
              break_min: batchSchedule?.break_min || 0
            }
          });
        }

        await sendEmail({
          to: employee.email,
          subject: "Your Login Credentials",
          text: `
            Hello ${employee.first_name}!
            
            Your account has been created successfully.
            
            Your login credentials are:
            Username: ${username}
            Password: password
            
            Please keep these credentials safe and change your password upon first login.
            
            Best regards,
            HR Team
          `,
        });

        return { employee: newEmployee, userId: newUser.id, username };
      } catch (error) {
        console.error("Transaction error:", {
          error,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    {
      timeout: 30000,
      maxWait: 10000,
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    let data;
    try {
      data = await request.json();
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!data?.credentials?.privilege_id) {
      return NextResponse.json(
        { message: "Privilege level is required" },
        { status: 400 }
      );
    }

    let validatedData;
    try {
      validatedData = employeeSchema.parse(data);
    } catch (error) {
      return NextResponse.json(
        {
          message: "Validation failed",
          details: error instanceof Error ? error.message : "Invalid data",
        },
        { status: 400 }
      );
    }

    // Create both employee and account in a single transaction
    const { employee, userId } = await createEmployeeWithAccount(
      validatedData,
      {
        employee: data,  // Pass the full data as employee since it contains all fields
        credentials: data.credentials,
      }
    );

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Employee creation failed:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    if (
      error instanceof Error &&
      error.message === "Username or email already exists"
    ) {
      return NextResponse.json(
        {
          message: "Username or email already exists",
        },
        { status: 409 }
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          return NextResponse.json(
            {
              message: "Username or email already exists",
            },
            { status: 409 }
          );
        case "P2003":
          return NextResponse.json(
            {
              message: "Invalid reference to related record",
            },
            { status: 400 }
          );
        default:
          return NextResponse.json(
            {
              message: "Database operation failed",
              details:
                process.env.NODE_ENV === "production"
                  ? undefined
                  : error.message,
            },
            { status: 400 }
          );
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          message: "Invalid data format",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
