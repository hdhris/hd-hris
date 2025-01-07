import { PrismaClient } from "@prisma/client";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/services/email-services";
import { generateUniqueUsername } from "@/lib/utils/generateUsername";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export async function updateEmployeeAccount(
  id: number,
  data: {
    privilege_id?: string;
    email?: string;
    resetPassword?: boolean;
  }
) {
  return await prisma.$transaction(
    async (tx) => {
      try {
        const employee = await tx.trans_employees.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            first_name: true,
            acl_user_access_control: {
              select: {
                id: true,
                privilege_id: true,
                trans_users: {
                  select: {
                    id: true,
                    email: true,
                    auth_credentials: true, // This will fetch the complete credentials
                  },
                },
              },
            },
          },
        });

        if (!employee) {
          throw new Error("Employee not found");
        }

        const currentEmail = (data.email || employee.email)!;
        if (!currentEmail) {
          throw new Error("No email address available");
        }

        const userAccount = employee.acl_user_access_control?.trans_users;
        // Fix the type error by properly checking the auth_credentials
        const userCredentials = userAccount?.auth_credentials;

            // Create new account if it doesn't exist
            if (!userAccount) {
              try {
                // 1. Prepare all the data first, outside any transaction
                const username = await generateUniqueUsername(currentEmail);
                const defaultPassword = await new SimpleAES().encryptData(
                  "password"
                );
    
                // 2. Single focused transaction for user creation
                const newUser = await tx.trans_users.create({
                  data: {
                    name: employee.first_name || "",
                    email: currentEmail,
                    auth_credentials: {
                      create: {
                        username,
                        password: defaultPassword,
                      },
                    },
                  },
                });
    
                // 3. Create access control in the same transaction
                await tx.acl_user_access_control.create({
                  data: {
                    employee_id: id,
                    user_id: newUser.id,
                    privilege_id: data.privilege_id
                      ? parseInt(data.privilege_id)
                      : 1,
                    created_at: new Date(),
                  },
                });
    
                // 4. Send email outside transaction to prevent timeouts
                try {
                  await sendEmail({
                    to: currentEmail,
                    subject: "New Account Credentials",
                    text: `
              Hello ${employee.first_name || ""}!
              
              Your new account has been created successfully.
              
              Here are your login credentials:
              Username: ${username}
              Temporary Password: password
              
              use it to https://www.hdhris.org/auth/login
              Please change your username and password upon first login.
    
              
              Best regards,
              HR Team
            `,
                  });
                } catch (emailError) {
                  // Log email error but don't fail the operation
                  console.error("Email sending failed but account created:", {
                    error: emailError,
                    employeeId: id,
                    email: currentEmail,
                    username,
                  });
                }
    
                return {
                  success: true,
                  message: "New account created successfully",
                  updated: { newAccount: true },
                  emailSent: true,
                };
              } catch (error) {
                // Detailed error logging
                console.error("Account creation error details:", {
                  error,
                  message: error instanceof Error ? error.message : String(error),
                  code:
                    error instanceof Error && "code" in error
                      ? (error as any).code
                      : undefined,
                  employeeId: id,
                  email: currentEmail,
                  timestamp: new Date().toISOString(),
                });
    
                // Specific error handling
                if (
                  error &&
                  typeof error === "object" &&
                  "code" in error &&
                  error.code === "P2002"
                ) {
                  throw new Error("Username or email already exists");
                }
    
                throw error;
              }
            }
            
        // Handle password reset
        if (data.resetPassword) {
          if (!userAccount || !userCredentials) {
            throw new Error("No user account found");
          }

          const newPassword = await new SimpleAES().encryptData("password");

          await tx.auth_credentials.update({
            where: { user_id: userAccount.id },
            data: { password: newPassword, updated_at: new Date() },
          });

          await sendEmail({
            to: currentEmail,
            subject: "Password Reset Notification",
            text: `
            Hello ${employee.first_name || ""}!
            
            Your password has been reset successfully.
            
            Temporary Password: password
            
            Please change your password immediately upon login.
            
            Best regards,
            HR Team
          `,
          });

          return {
            success: true,
            message: "Password reset successfully",
            updated: { password: true },
          };
        }

    
        // Handle privilege update
        if (data.privilege_id && employee.acl_user_access_control) {
          const currentPrivilegeId =
            employee.acl_user_access_control.privilege_id;
          const newPrivilegeId = parseInt(data.privilege_id);

          const newPrivilege = await tx.sys_privileges.findUnique({
            where: { id: newPrivilegeId },
            select: { name: true },
          });

          if (currentPrivilegeId !== newPrivilegeId) {
            await tx.acl_user_access_control.update({
              where: { id: employee.acl_user_access_control.id },
              data: { privilege_id: newPrivilegeId, update_at: new Date() },
            });

            await sendEmail({
              to: currentEmail,
              subject: "Access Level Update",
              text: `
              Hello ${employee.first_name || ""}!
              
              Your access level has been updated to ${
                newPrivilege?.name || "Unknown"
              }.
              
              Best regards,
              HR Team
            `,
            });

            return {
              success: true,
              message: "Access level updated successfully",
              updated: { privilege: true },
            };
          }
        }

        // Handle email update
        if (data.email && userAccount && data.email !== userAccount.email) {
          await tx.trans_users.update({
            where: { id: userAccount.id },
            data: { email: data.email },
          });

          return {
            success: true,
            message: "Email updated successfully",
            updated: { email: true },
          };
        }

        return {
          success: true,
          message: "No updates required",
          updated: {},
        };
      } catch (error) {
        console.error("Account operation error:", {
          error,
          employeeId: id,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    {
      timeout: process.env.NODE_ENV === "production" ? 20000 : 30000,
      maxWait: process.env.NODE_ENV === "production" ? 20000 : 30000,
    }
  );
}
