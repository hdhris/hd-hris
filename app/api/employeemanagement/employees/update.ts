import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { employeeSchema, StatusUpdateInput, statusUpdateSchema } from "./types";
import { parseJsonInput } from "./utils";
import { updateEmployeeStatus } from "./status";
import { updateEmployeeAccount } from "./updateAccount";
import { toGMT8 } from "@/lib/utils/toGMT8";
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

async function validateEmailUpdate(id: number, newEmail: string) {
  const existingEmployee = await prisma.trans_employees.findFirst({
    where: {
      email: newEmail,
      NOT: {
        id: id,
      },
    },
  });

  if (existingEmployee) {
    throw new Error("Email already in use by another employee");
  }
}

async function updateEmployee(id: number, employeeData: any) {
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
        if (employeeData.email) {
          await validateEmailUpdate(id, employeeData.email);
        }

        const existingEmployee = await tx.trans_employees.findUnique({
          where: { id },
        });

        if (!existingEmployee) {
          throw new Error("Employee not found");
        }
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

        const updatedEmployee = await tx.trans_employees.update({
          where: { id },
          data: {
            ...rest,
            branch_id: Number(rest.branch_id),
            employement_status_id: Number(rest.employement_status_id),
            hired_at: rest.hired_at ? parseDates(rest.hired_at) : null,
            birthdate: rest.birthdate ? parseDates(rest.birthdate) : null,
            educational_bg_json: educationalBackground,
            family_bg_json: familyBackground,
            created_at: toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
          },
        });

        if (job_id) {
          await tx.trans_employees.update({
            where: { id: updatedEmployee.id },
            data: { ref_job_classes: { connect: { id: Number(job_id) } } },
          });
        }

        if (department_id) {
          await tx.trans_employees.update({
            where: { id: updatedEmployee.id },
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
        
          // Check if employee has any existing schedule
          const existingSchedule = await tx.dim_schedules.findFirst({
            where: {
              employee_id: id,
              deleted_at: null
            }
          });
        
          if (existingSchedule) {
            // If there's an existing schedule, end it
            await tx.dim_schedules.updateMany({
              where: {
                employee_id: id,
                end_date: null,
                deleted_at: null
              },
              data: {
                end_date: currentDate,
                updated_at: currentDate
              }
            });
          }
        
          // Create new schedule with batch schedule details
          await tx.dim_schedules.create({
            data: {
              employee_id: id,
              batch_id: Number(schedules[0].batch_id),
              days_json: schedules[0].days_json,
              created_at: currentDate,
              updated_at: currentDate,
              start_date: currentDate, // Always set start_date for new schedules
              end_date: null,
              clock_in: batchSchedule?.clock_in || null,
              clock_out: batchSchedule?.clock_out || null,
              break_min: batchSchedule?.break_min || 0
            }
          });
        }

        return { employee: updatedEmployee };
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

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const updateType = url.searchParams.get("type");

    if (!id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    let data;
    try {
      data = await req.json();
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const employeeId = parseInt(id);
    if (isNaN(employeeId)) {
      return NextResponse.json(
        { message: "Invalid employee ID format" },
        { status: 400 }
      );
    }

    switch (updateType) {
      case "account":
        try {
          const accountResult = await updateEmployeeAccount(employeeId, data);
          return NextResponse.json(accountResult);
        } catch (error) {
          if (error instanceof Error) {
            switch (error.message) {
              case "Employee not found":
                return NextResponse.json(
                  { message: "Employee not found" },
                  { status: 404 }
                );
              case "User account not found":
                return NextResponse.json(
                  { message: "User account not found" },
                  { status: 404 }
                );
              case "Username already taken":
                return NextResponse.json(
                  { message: "Username already taken" },
                  { status: 409 }
                );
              default:
                return NextResponse.json(
                  {
                    message:
                      process.env.NODE_ENV === "production"
                        ? "Failed to update account"
                        : error.message,
                  },
                  { status: 400 }
                );
            }
          }
          throw error;
        }

      case "status":
        try {
          // const validatedStatusData = statusUpdateSchema.parse(data);
          const statusResult = await updateEmployeeStatus(
            employeeId,
            data
          );
          return NextResponse.json(statusResult);
        } catch (error) {
          return NextResponse.json(
            {
              message: "Invalid status update data",
              details:
                error instanceof Error ? error.message : "Validation failed",
            },
            { status: 400 }
          );
        }

      default:
        try {
          const validatedData = employeeSchema.partial().parse(data);
          const updateResult = await updateEmployee(employeeId, validatedData);
          return NextResponse.json(updateResult);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === "Employee not found"
          ) {
            return NextResponse.json(
              { message: "Employee not found" },
              { status: 404 }
            );
          }

          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
              case "P2002":
                return NextResponse.json(
                  { message: "Unique constraint violation" },
                  { status: 409 }
                );
              case "P2003":
                return NextResponse.json(
                  { message: "Invalid reference to related record" },
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
              { message: "Invalid data format" },
              { status: 400 }
            );
          }

          throw error;
        }
    }
  } catch (error) {
    console.error("Update operation failed:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message:
          process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : error instanceof Error
            ? error.message
            : "Unknown error",
        status: "error",
      },
      { status: 500 }
    );
  }
}