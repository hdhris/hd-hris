import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/lib/utils/sendEmail";
import { employeeSchema, StatusUpdateInput, statusUpdateSchema } from "./types";
import { parseJsonInput } from "./utils";

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

        const educationalBackground = parseJsonInput(educational_bg_json);
        const familyBackground = parseJsonInput(family_bg_json);

        const updatedEmployee = await tx.trans_employees.update({
          where: { id },
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
          await tx.dim_schedules.createMany({
            data: schedules.map((schedule: any) => ({
              employee_id: updatedEmployee.id,
              batch_id: Number(schedule.batch_id),
              days_json: schedule.days_json,
              created_at: new Date(),
              updated_at: new Date(),
            })),
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

async function updateEmployeeAccount(
  id: number,
  data: { username?: string; password?: string; privilege_id?: string }
) {
  try {
    const employee = await prisma.trans_employees.findUnique({
      where: { id },
      select: {
        email: true,
        first_name: true,
      },
    });

    if (!employee || !employee.email) {
      throw new Error("Employee not found");
    }

    let user = await prisma.trans_users.findFirst({
      where: { email: employee.email },
    });

    if (!user) {
      user = await prisma.trans_users.create({
        data: {
          email: employee.email,
          name: employee.first_name,
        },
      });
    }

    let currentCredentials = await prisma.auth_credentials.findFirst({
      where: { user_id: user.id.toString() },
    });

    let emailText = `Hello ${employee.first_name}!\n\n`;
    let emailSubject = "";
    let updates = [];

    // Handle privilege update
    if (data.privilege_id) {
      const previousPrivilege = await prisma.acl_user_access_control.findUnique(
        {
          where: {
            user_id: user.id.toString(),
          },
          include: {
            sys_privileges: true,
          },
        }
      );

      const newPrivilege = await prisma.sys_privileges.findUnique({
        where: {
          id: parseInt(data.privilege_id),
        },
      });

      await prisma.acl_user_access_control.upsert({
        where: {
          user_id: user.id.toString(),
        },
        create: {
          employee_id: id,
          user_id: user.id.toString(),
          privilege_id: parseInt(data.privilege_id),
          created_at: new Date(),
        },
        update: {
          privilege_id: parseInt(data.privilege_id),
          update_at: new Date(),
        },
      });

      if (
        newPrivilege &&
        (!previousPrivilege ||
          previousPrivilege.privilege_id !== parseInt(data.privilege_id))
      ) {
        emailText += `Your account privileges have been updated to: ${newPrivilege.name}\n\n`;
        updates.push("privilege");
      }
    }

    // Handle password reset
    if (data.password && currentCredentials) {
      const encryptedPassword = await new SimpleAES().encryptData(
        data.password
      );
      await prisma.auth_credentials.update({
        where: { id: currentCredentials.id },
        data: { password: encryptedPassword },
      });

      emailText += `Your password has been reset. Your new password is: ${data.password}\n\n`;
      updates.push("password");
    }

    // Send email if there were any updates
    if (updates.length > 0) {
      emailText += `Please log in to the app to access your updated account.\n\nBest regards,\nHR Team`;
      emailSubject = `Account Update: ${updates.join(" and ")} updated`;

      try {
        await sendEmail({
          to: employee.email,
          subject: emailSubject,
          text: emailText,
        });
      } catch (emailError) {
        console.error("Failed to send account update email:", emailError);
      }
    }

    return {
      success: true,
      message: `Account updated successfully (${updates.join(", ")})`,
      updated: {
        password: updates.includes("password"),
        privilege: updates.includes("privilege"),
      },
    };
  } catch (error) {
    console.error("Account operation error:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

async function updateEmployeeStatus(id: number, data: StatusUpdateInput) {
  try {
    const { status, reason, date, endDate } = data;

    const updateData: Prisma.trans_employeesUpdateInput = {
      updated_at: new Date(),
    };

    if (status === "active") {
      updateData.suspension_json = Prisma.JsonNull;
      updateData.resignation_json = Prisma.JsonNull;
      updateData.termination_json = Prisma.JsonNull;
    } else {
      switch (status) {
        case "suspended":
          updateData.suspension_json = {
            suspensionReason: reason,
            startDate: date,
            endDate: endDate,
          };
          break;
        case "resigned":
          updateData.resignation_json = {
            resignationReason: reason,
            resignationDate: date,
          };
          break;
        case "terminated":
          updateData.termination_json = {
            terminationReason: reason,
            terminationDate: date,
          };
          break;
      }
    }

    const employee = await prisma.trans_employees.update({
      where: { id },
      data: updateData,
    });

    return employee;
  } catch (error) {
    console.error("Status update failed:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
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
          const validatedStatusData = statusUpdateSchema.parse(data);
          const statusResult = await updateEmployeeStatus(
            employeeId,
            validatedStatusData
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
