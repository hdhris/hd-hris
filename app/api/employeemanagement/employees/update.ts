// app/api/employeemanagement/employees/UPDATE.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/lib/utils/sendEmail";
import { employeeSchema, StatusUpdateInput, statusUpdateSchema } from "./types";

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

async function updateEmployee(id: number, employeeData: any) {
  return await prisma.$transaction(
    async (tx) => {
      try {
        const existingEmployee = await tx.trans_employees.findUnique({
          where: { id },
          include: {
            dim_schedules: true,
          },
        });

        if (!existingEmployee) {
          throw new Error("Employee not found");
        }

        const updatedEmployee = await tx.trans_employees.update({
          where: { id },
          data: {
            picture: employeeData.picture,
            prefix: employeeData.prefix,
            first_name: employeeData.first_name,
            middle_name: employeeData.middle_name,
            last_name: employeeData.last_name,
            suffix: employeeData.suffix,
            extension: employeeData.extension,
            gender: employeeData.gender,
            email: employeeData.email,
            contact_no: employeeData.contact_no,
            birthdate: employeeData.birthdate
              ? new Date(employeeData.birthdate)
              : undefined,
            hired_at: employeeData.hired_at
              ? new Date(employeeData.hired_at)
              : undefined,
            updated_at: new Date(),
            educational_bg_json: employeeData.educational_bg_json,
            family_bg_json: employeeData.family_bg_json,

            addr_region: employeeData.addr_region
              ? Number(employeeData.addr_region)
              : undefined,
            addr_province: employeeData.addr_province
              ? Number(employeeData.addr_province)
              : undefined,
            addr_municipal: employeeData.addr_municipal
              ? Number(employeeData.addr_municipal)
              : undefined,
            addr_baranggay: employeeData.addr_baranggay
              ? Number(employeeData.addr_baranggay)
              : undefined,
            branch_id: employeeData.branch_id
              ? Number(employeeData.branch_id)
              : undefined,
            employement_status_id: employeeData.employement_status_id
              ? Number(employeeData.employement_status_id)
              : undefined,
          },
          include: {
            dim_schedules: true,
            ref_branches: true,
            ref_departments: true,
            ref_job_classes: true,
            ref_employment_status: true,
            ref_salary_grades: true,
          },
        });

        // Handle schedule updates
        if (Array.isArray(employeeData.schedules)) {
          await tx.dim_schedules.deleteMany({
            where: { employee_id: id },
          });

          if (employeeData.schedules.length > 0) {
            await tx.dim_schedules.createMany({
              data: employeeData.schedules.map((schedule: any) => ({
                employee_id: id,
                batch_id: Number(schedule.batch_id),
                days_json: schedule.days_json,
                created_at: new Date(),
                updated_at: new Date(),
              })),
            });
          }
        }

        return updatedEmployee;
      } catch (error) {
        console.error("Update transaction failed:", {
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
    // Find employee
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

    // Find or create user account
    let user = await prisma.trans_users.findFirst({
      where: { email: employee.email },
    });

    // If no user exists, create one
    if (!user) {
      user = await prisma.trans_users.create({
        data: {
          email: employee.email,
          name: employee.first_name,
          // Add any other required fields for user creation
        },
      });
    }

    // Find existing credentials
    let currentCredentials = await prisma.auth_credentials.findFirst({
      where: { user_id: user.id.toString() },
    });

    const updateData: any = {};
    let usernameUpdated = false;
    let passwordUpdated = false;

    // If no credentials exist, we'll create new ones
    if (!currentCredentials) {
      if (!data.username || !data.password) {
        throw new Error("Username and password required for new account");
      }

      // Check username uniqueness
      const existingUsername = await prisma.auth_credentials.findFirst({
        where: { username: data.username },
      });

      if (existingUsername) {
        throw new Error("Username already taken");
      }

      // Create new credentials
      const encryptedPassword = await new SimpleAES().encryptData(
        data.password
      );
      currentCredentials = await prisma.auth_credentials.create({
        data: {
          user_id: user.id.toString(),
          username: data.username,
          password: encryptedPassword,
        },
      });

      usernameUpdated = true;
      passwordUpdated = true;

      if (data.privilege_id) {
        await prisma.acl_user_access_control.create({
          data: {
            employee_id: id,
            user_id: user.id.toString(),
            privilege_id: parseInt(data.privilege_id),
            created_at: new Date(),
          },
        });
      }

    } else {
      // Handle updates for existing credentials
      if (data.username && data.username !== currentCredentials.username) {
        const existingUsername = await prisma.auth_credentials.findFirst({
          where: {
            username: data.username,
            NOT: { user_id: user.id.toString() },
          },
        });

        if (existingUsername) {
          throw new Error("Username already taken");
        }

        updateData.username = data.username;
        usernameUpdated = true;
      }

      if (data.password) {
        updateData.password = await new SimpleAES().encryptData(data.password);
        passwordUpdated = true;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await prisma.auth_credentials.update({
          where: { id: currentCredentials.id },
          data: updateData,
        });
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.auth_credentials.update({
        where: { id: currentCredentials.id },
        data: updateData,
      });
    }

    // Add here - for existing accounts
    if (data.privilege_id) {
      await prisma.acl_user_access_control.upsert({
        where: {
          user_id: user.id.toString(),
        },
        create: {
          employee_id: id,
          user_id: user.id.toString(),
          privilege_id: parseInt(data.privilege_id),
          created_at: new Date()
        },
        update: {
          privilege_id: parseInt(data.privilege_id),
          update_at: new Date()
        }
      });
    }

    // Send email notification about the changes
    try {
      let emailText = `Hello ${employee.first_name}!\n\nYour account has been ${
        currentCredentials ? "updated" : "created"
      }.\n`;

      if (passwordUpdated) {
        emailText += `\nYour new password is: ${data.password}`;
      }

      if (usernameUpdated) {
        emailText += `\nYour new username is: ${data.username}`;
      }

      emailText += `\n\nPlease use these credentials for your next login.\n\nBest regards,\nHR Team`;

      await sendEmail({
        to: employee.email,
        subject: `Account ${
          currentCredentials ? "Update" : "Creation"
        } Notification`,
        text: emailText,
      });
    } catch (emailError) {
      console.error("Failed to send account email:", emailError);
    }

    return {
      success: true,
      message: currentCredentials
        ? `Account ${
            Object.keys(updateData).length > 0 ? "updated" : "unchanged"
          }${usernameUpdated ? " (username)" : ""}${
            passwordUpdated ? " (password)" : ""
          }`
        : "Account created successfully",
      updated: {
        username: usernameUpdated,
        password: passwordUpdated,
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
        {
          message: "Employee ID is required",
        },
        { status: 400 }
      );
    }

    // Validate request body
    let data;
    try {
      data = await req.json();
    } catch (e) {
      return NextResponse.json(
        {
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const employeeId = parseInt(id);
    if (isNaN(employeeId)) {
      return NextResponse.json(
        {
          message: "Invalid employee ID format",
        },
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
                  {
                    message: "Employee not found",
                  },
                  { status: 404 }
                );
              case "User account not found":
                return NextResponse.json(
                  {
                    message: "User account not found",
                  },
                  { status: 404 }
                );
              case "Username already taken":
                return NextResponse.json(
                  {
                    message: "Username already taken",
                  },
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
              {
                message: "Employee not found",
              },
              { status: 404 }
            );
          }

          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
              case "P2002":
                return NextResponse.json(
                  {
                    message: "Unique constraint violation",
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
