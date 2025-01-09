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
  // First check employees table
  const existingEmployee = await prisma.trans_employees.findFirst({
    where: {
      email: newEmail,
      NOT: {
        id: id,
      },
    },
  });

  // Then check users table through access control
  const existingUserWithAccess = await prisma.trans_users.findFirst({
    where: {
      email: newEmail,
      acl_user_access_control: {
        employee_id: {
          not: id,
        },
      },
    },
  });

  if (existingEmployee || existingUserWithAccess) {
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
        const updatePromises = [];

        if (employeeData.email) {
          updatePromises.push(validateEmailUpdate(id, employeeData.email));
        }

        const existingEmployee = await tx.trans_employees.findUnique({
          where: { id },
          include: {
            acl_user_access_control: {
              include: {
                trans_users: {
                  include: {
                    auth_credentials: true,
                  },
                },
              },
            },
          },
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

        updatePromises.push(
          tx.trans_employees.update({
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
          })
        );

        if (
          employeeData.email &&
          existingEmployee.acl_user_access_control?.trans_users
        ) {
          updatePromises.push(
            tx.trans_users.update({
              where: {
                id: existingEmployee.acl_user_access_control.trans_users.id,
              },
              data: { email: employeeData.email },
            })
          );
        }

        if (job_id) {
          updatePromises.push(
            tx.trans_employees.update({
              where: { id },
              data: { ref_job_classes: { connect: { id: Number(job_id) } } },
            })
          );
        }

        if (department_id) {
          updatePromises.push(
            tx.trans_employees.update({
              where: { id },
              data: {
                ref_departments: { connect: { id: Number(department_id) } },
              },
            })
          );
        }

//        // Inside your updateEmployee function
// if (Array.isArray(schedules) && schedules.length > 0) {
//   // First, fetch the current active schedule with complete fields
//   const currentSchedule = await tx.dim_schedules.findFirst({
//     where: {
//       employee_id: id,
//       end_date: null,
//       deleted_at: null,
//     },
//     select: {
//       id: true,
//       batch_id: true,
//       days_json: true,
//       clock_in: true,
//       clock_out: true,
//       break_min: true
//     }
//   });

//   // Normalize schedule data for comparison
//   const normalizeSchedule = (days: any) => {
//     if (!days) return JSON.stringify([]);
//     const daysArray = typeof days === 'string' ? JSON.parse(days) : days;
//     return JSON.stringify([...(daysArray || [])].sort());
//   };

//   const currentDays = currentSchedule ? normalizeSchedule(currentSchedule.days_json) : '';
//   const newDays = normalizeSchedule(schedules[0].days_json);
  
//   // Compare all relevant schedule fields
//   const isRealScheduleChange = (
//     !currentSchedule || 
//     currentSchedule.batch_id !== Number(schedules[0].batch_id) ||
//     currentDays !== newDays ||
//     currentSchedule.clock_in?.toString() !== schedules[0].clock_in?.toString() ||
//     currentSchedule.clock_out?.toString() !== schedules[0].clock_out?.toString() ||
//     (currentSchedule.break_min || 0) !== (schedules[0].break_min || 0)
//   );

//   // Only proceed if there's an actual change
//   if (isRealScheduleChange) {
//     const currentDate = new Date();

//     // If there's an existing schedule, close it
//     if (currentSchedule) {
//       updatePromises.push(
//         tx.dim_schedules.update({
//           where: { id: currentSchedule.id },
//           data: {
//             end_date: currentDate,
//             updated_at: currentDate,
//           },
//         })
//       );
//     }

//     // Verify batch exists before creating new schedule
//     if (schedules[0].batch_id) {
//       const batchSchedule = await tx.ref_batch_schedules.findUnique({
//         where: {
//           id: Number(schedules[0].batch_id),
//           deleted_at: null
//         }
//       });

//       if (batchSchedule) {
//         // Create new schedule with all fields
//         updatePromises.push(
//           tx.dim_schedules.create({
//             data: {
//               employee_id: id,
//               batch_id: Number(schedules[0].batch_id),
//               days_json: schedules[0].days_json,
//               created_at: currentDate,
//               updated_at: currentDate,
//               start_date: currentDate,
//               clock_in: schedules[0].clock_in || batchSchedule.clock_in || null,
//               clock_out: schedules[0].clock_out || batchSchedule.clock_out || null,
//               break_min: schedules[0].break_min || batchSchedule.break_min || 0,
//               end_date: null // explicitly set to null for clarity
//             },
//           })
//         );
//       } else {
//         throw new Error("Invalid batch schedule selected");
//       }
//     } else {
//       // If no batch_id is provided, we're just ending the current schedule
//       // The schedule is already ended above if it existed, so no additional action needed
//     }
//   }
//   // If no real change, do nothing - the schedule remains unchanged
// }

// // Continue with the rest of your update logic
// const [updatedEmployee] = await Promise.all(updatePromises);

if (Array.isArray(schedules) && schedules.length > 0) {
  // First, fetch the current active schedule with complete fields
  const currentSchedule = await tx.dim_schedules.findFirst({
    where: {
      employee_id: id,
      end_date: null,
      deleted_at: null,
    },
    select: {
      id: true,
      batch_id: true,
      days_json: true,
      clock_in: true,
      clock_out: true,
      break_min: true
    }
  });

  // Normalize schedule data for comparison
  const normalizeSchedule = (days: any) => {
    if (!days) return JSON.stringify([]);
    const daysArray = typeof days === 'string' ? JSON.parse(days) : days;
    return JSON.stringify([...(daysArray || [])].sort());
  };

  const currentDays = currentSchedule ? normalizeSchedule(currentSchedule.days_json) : '';
  const newDays = normalizeSchedule(schedules[0].days_json);

  // Compare all relevant schedule fields
  const isRealScheduleChange = (
    !currentSchedule || 
    currentSchedule.batch_id !== Number(schedules[0].batch_id) ||
    currentDays !== newDays ||
    currentSchedule.clock_in?.toString() !== schedules[0].clock_in?.toString() ||
    currentSchedule.clock_out?.toString() !== schedules[0].clock_out?.toString() ||
    (currentSchedule.break_min || 0) !== (schedules[0].break_min || 0)
  );

  // Only proceed if there's an actual change
  if (isRealScheduleChange) {
    const currentDate = new Date();

    // If there's an existing schedule, close it
    if (currentSchedule) {
      updatePromises.push(
        tx.dim_schedules.update({
          where: { id: currentSchedule.id },
          data: {
            end_date: currentDate,
            updated_at: currentDate,
          },
        })
      );
    }

    // Create new schedule with all fields
    updatePromises.push(
      tx.dim_schedules.create({
        data: {
          employee_id: id,
          batch_id: Number(schedules[0].batch_id),
          days_json: schedules[0].days_json,
          created_at: currentDate,
          updated_at: currentDate,
          start_date: currentDate,
          clock_in: schedules[0].clock_in || null,
          clock_out: schedules[0].clock_out || null,
          break_min: schedules[0].break_min || 0,
          end_date: null // explicitly set to null for clarity
        },
      })
    );
  }
  // If no real change, do nothing - the schedule remains unchanged
}

const [updatedEmployee] = await Promise.all(updatePromises);



        return { employee: updatedEmployee };
      } catch (error) {
        console.error("Transaction error:", error);
        throw error;
      }
    },
    {
      timeout: 10000,
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
          const statusResult = await updateEmployeeStatus(employeeId, data);
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

          const updatePromises: Promise<any>[] = [];

          const result = await prisma.$transaction(
            async (tx) => {
              const updateResult = await updateEmployee(
                employeeId,
                validatedData
              );

              // Only update account if email or privilege changed
              if (validatedData.email || data.privilege_id) {
                updatePromises.push(
                  updateEmployeeAccount(employeeId, {
                    privilege_id: data.privilege_id?.toString(),
                    email: validatedData.email,
                  })
                );
              }

              // Wait for all additional update promises
              if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
              }

              return updateResult;
            },
            {
              timeout: 20000, // 20 seconds
              maxWait: 20000, // 20 seconds
            }
          );

          return NextResponse.json(result);
        } catch (error) {
          // More specific error handling first
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
              case "P2002":
                return NextResponse.json(
                  { message: "Email or username already exists" },
                  { status: 409 }
                );
              case "P2003":
                return NextResponse.json(
                  { message: "One or more selected values are invalid" },
                  { status: 400 }
                );
              case "P2025":
                return NextResponse.json(
                  { message: "Record not found" },
                  { status: 404 }
                );
              default:
                console.error("Prisma error:", error);
                return NextResponse.json(
                  { message: error.message || "Failed to update employee" },
                  { status: 400 }
                );
            }
          }

          // General error handling
          console.error("Update error:", error);
          return NextResponse.json(
            {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to update employee",
            },
            { status: 400 }
          );
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
