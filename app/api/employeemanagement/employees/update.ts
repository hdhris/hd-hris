import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/lib/utils/sendEmail";
import { employeeSchema, StatusUpdateInput, statusUpdateSchema } from "./types";
import { parseJsonInput } from "./utils";
import { getSession } from "next-auth/react"
import { getSignatory } from "@/server/signatory";
import { auth } from "@/auth";
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
  return await prisma.$transaction(async (tx) => {
    try {
      // Step 1: Find employee
      const employee = await tx.trans_employees.findUnique({
        where: { id },
        select: {
          email: true,
          first_name: true,
        },
      });

      if (!employee || !employee.email) {
        throw new Error("Employee not found");
      }

      // Step 2: Find or create user
      let user = await tx.trans_users.findFirst({
        where: { email: employee.email },
      });

      if (!user) {
        user = await tx.trans_users.create({
          data: {
            email: employee.email,
            name: employee.first_name,
          },
        });
      }

      // Step 3: Get current credentials
      let currentCredentials = await tx.auth_credentials.findFirst({
        where: { user_id: user.id.toString() },
      });

      let emailText = `Hello ${employee.first_name}!\n\n`;
      let emailSubject = "";
      let updates = [];

      // Step 4: Handle username uniqueness check
      if (data.username && (!currentCredentials || data.username !== currentCredentials.username)) {
        const existingUsername = await tx.auth_credentials.findFirst({
          where: {
            username: data.username,
            NOT: {
              id: currentCredentials?.id
            }
          }
        });

        if (existingUsername) {
          throw new Error("Username already taken");
        }
      }

      // Step 5: Handle password reset or creation
      if (data.password) {
        const des = new SimpleAES();
        
        if (currentCredentials) {
          try {
            const des = new SimpleAES();
            const encryptedPassword = await des.encryptData(data.password);
            
            // IMPORTANT FIX: Update using the exact same method as registration
            const updateResult = await tx.auth_credentials.update({
              where: { 
                user_id: user.id.toString()  // Use user_id instead of credentials.id
              },
              data: {
                password: encryptedPassword  // Just store the encrypted password directly
              }
            });
        
            if (!updateResult) {
              throw new Error("Password reset failed");
            }
        
            emailText += `Your password has been successfully reset.\n`;
            emailText += `Username: ${currentCredentials.username}\n`;
            emailText += `New Password: ${data.password}\n\n`;
            updates.push("password_reset");
        
          } catch (error) {
            console.error("Password reset failed:", error);
            throw new Error("Failed to reset password");
          }
        } else {
          // Create new account
          const encryptedPassword = await des.encryptData(data.password);
          
          if (!encryptedPassword) {
            throw new Error("Failed to encrypt password");
          }

          currentCredentials = await tx.auth_credentials.create({
            data: {
              user_id: user.id.toString(),
              username: data.username || employee.email,
              password: encryptedPassword,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });

          emailText += `Welcome to our system! Your account has been successfully created.\n\n`;
          emailText += `Here are your login credentials:\n`;
          emailText += `Username: ${data.username || employee.email}\n`;
          emailText += `Initial Password: ${data.password}\n\n`;
          emailText += `For security reasons, please change your password after your first login.\n\n`;
          updates.push("account_created");
        }
      }

      // Step 6: Handle privilege update
      if (data.privilege_id) {
        const existingAccessControl = await tx.acl_user_access_control.findFirst({
          where: {
            OR: [
              { employee_id: id },
              { user_id: user.id.toString() }
            ]
          }
        });

        if (existingAccessControl) {
          await tx.acl_user_access_control.update({
            where: {
              id: existingAccessControl.id
            },
            data: {
              privilege_id: parseInt(data.privilege_id),
              update_at: new Date(),
              employee_id: id,
              user_id: user.id.toString()
            },
          });
        } else {
          await tx.acl_user_access_control.create({
            data: {
              employee_id: id,
              user_id: user.id.toString(),
              privilege_id: parseInt(data.privilege_id),
              created_at: new Date(),
            },
          });
        }

        const privilege = await tx.sys_privileges.findUnique({
          where: { id: parseInt(data.privilege_id) },
        });

        if (privilege) {
          if (updates.includes("account_created")) {
            emailText += `Your account has been assigned the role: ${privilege.name}\n\n`;
          } else {
            emailText += `Your access level has been updated to: ${privilege.name}\n\n`;
          }
          updates.push("privilege");
        }
      }

      // Step 7: Send email notification
      if (updates.length > 0) {
        emailText += `You can access the system at: ${process.env.NEXT_PUBLIC_APP_URL || 'our system'}\n\n`;
        emailText += `If you did not request this change, please contact HR immediately.\n\n`;
        emailText += `Best regards,\nHR Team`;
        
        emailSubject = updates.includes("account_created") 
          ? "Welcome! Your New Account Details" 
          : `Account Update: ${updates.join(" and ")}`;

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

      // Step 8: Return success response
      return {
        success: true,
        message: updates.includes("account_created")
          ? "Account created successfully"
          : `Account ${updates.join(" and ")} completed successfully`,
        updated: {
          password: updates.includes("password_reset") || updates.includes("account_created"),
          privilege: updates.includes("privilege"),
          username: data.username ? true : false
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
  }, {
    maxWait: 10000,
    timeout: 30000,
  });
}

async function updateEmployeeStatus(id: number, data: StatusUpdateInput) {
  try {
   const session = await auth();

    const { status, reason, date, endDate } = data;
    const updateData: Prisma.trans_employeesUpdateInput = {
      updated_at: new Date(),
    };

    

    const signatoryPath = 
      status === 'suspended' ? 'employee_suspension' :
      status === 'resigned' ? 'employee_resignation' :
      status === 'terminated' ? 'employee_termination' : null;

    const signatories = signatoryPath 
      ? await getSignatory(signatoryPath, id, false) 
      : null;

    // Transform signatories to a simple JSON object
    const transformedSignatories = signatories ? {
      users: signatories.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role
      }))
    } : null;

    
    // Rest of your existing logic, using session if needed
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
            signatories: transformedSignatories,
            initiatedBy: session?.user ? {
              id: session.user.id,
              name: session.user.name,
              picture: session.user.image
            } : null
          };
          break;
        case "resigned":
          updateData.resignation_json = {
            resignationReason: reason,
            resignationDate: date,
            signatories: transformedSignatories,
            initiatedBy: session?.user ? {
              id: session.user.id,
              name: session.user.name,
              picture: session.user.image
            } : null
          };
          break;
        case "terminated":
          updateData.termination_json = {
            terminationReason: reason,
            terminationDate: date,
            signatories: transformedSignatories,
            initiatedBy: session?.user ? {
              id: session.user.id,
              name: session.user.name,
              picture: session.user.image
            } : null
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
