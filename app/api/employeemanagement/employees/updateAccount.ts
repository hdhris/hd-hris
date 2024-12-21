
import { PrismaClient, Prisma } from "@prisma/client";
import { StatusUpdateInput } from "./types";
import { getSignatory } from "@/server/signatory";
import { auth } from "@/auth";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/services/email-services";

const prisma = new PrismaClient({
  log: ["error"],
});

export async function updateEmployeeAccount(
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