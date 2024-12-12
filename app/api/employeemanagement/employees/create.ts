// app/api/employeemanagement/employees/CREATE.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/lib/utils/sendEmail";
import { employeeSchema } from "./types";
import { parseJsonInput } from "./utils";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient({
  log: ['error'], // Only log errors regardless of environment
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
        // Step 1: Check if username or email already exists
        const existingUser = await tx.trans_users.findFirst({
          where: {
            OR: [
              { email: employee.email },
              { auth_credentials: { username: credentials.username } },
            ],
          },
        });

        if (existingUser) {
          throw new Error("Username or email already exists");
        }

        // Step 2: Create user account and credentials
        const newUser = await tx.trans_users.create({
          data: {
            name: employee.first_name,
            email: employee.email,
            auth_credentials: {
              create: {
                username: credentials.username,
                password: await new SimpleAES().encryptData(
                  credentials.password
                ),
              },
            },
          },
        });

        // Step 3: Create employee record
        const educationalBackground = parseJsonInput(educational_bg_json);
        const familyBackground = parseJsonInput(family_bg_json);

        const newEmployee = await tx.trans_employees.create({
          data: {
            ...rest,
            branch_id: Number(rest.branch_id),
            employement_status_id: Number(rest.employement_status_id),
            hired_at: rest.hired_at ? new Date(rest.hired_at) : null,
            birthdate: rest.birthdate ? new Date(rest.birthdate) : null,
            educational_bg_json: educationalBackground,
            family_bg_json: familyBackground,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // NEW Step: Create access control record
        await tx.acl_user_access_control.create({
          data: {
            employee_id: newEmployee.id,
            user_id: newUser.id,
            privilege_id: Number(credentials.privilege_id),
            created_at: new Date()
          }
        });

        // Step 4: Handle job and department connections
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
          await tx.dim_schedules.createMany({
            data: schedules.map((schedule: any) => ({
              employee_id: newEmployee.id,
              batch_id: Number(schedule.batch_id),
              days_json: schedule.days_json,
              created_at: new Date(),
              updated_at: new Date(),
            })),
          });
        }

        return { employee: newEmployee, userId: newUser.id };
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
    // Validate request body
    let data;
    try {
      data = await request.json();
    } catch (e) {
      return NextResponse.json(
        {
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !data?.employee?.email ||
      !data?.credentials?.username ||
      !data?.credentials?.password ||
      !data?.credentials?.privilege_id  // Add this check
    ) {
      return NextResponse.json(
        {
          message: "Email, username, password and privilege level are required",
        },
        { status: 400 }
      );
    }
    
    // Validate employee data
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
        employee: data.employee,
        credentials: data.credentials,
      }
    );

    // Send welcome email (non-blocking)
    sendEmail({
      to: data.employee.email,
      subject: "Your Login Credentials",
      text: `
        Hello ${data.employee.first_name}!
        
        Your account has been created successfully.
        
        Your login credentials are:
        Username: ${data.credentials.username}
        Password: ${data.credentials.password}
        
        Please keep these credentials safe and change your password upon first login.
        
        Best regards,
        HR Team
      `,
    }).catch((err) => console.error("Failed to send welcome email:", err));

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Employee creation failed:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

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
