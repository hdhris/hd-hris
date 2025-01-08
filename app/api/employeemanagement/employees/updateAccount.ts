import { PrismaClient } from "@prisma/client";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/services/email-services";
import { generateUniqueUsername } from "@/lib/utils/generateUsername";

const prisma = new PrismaClient({
  log: ["error"],
});

export async function updateEmployeeAccount(id: number, data: {
  privilege_id?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    try {
      // First find employee
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

      // Check if user exists for this email
      const existingUser = await tx.trans_users.findFirst({
        where: { email: employee.email }
      });

      // If no account exists, create one immediately
      if (!existingUser) {
        const username = await generateUniqueUsername(employee.email);

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

        await tx.acl_user_access_control.create({
          data: {
            employee_id: id,
            user_id: newUser.id,
            privilege_id: 1,
            created_at: new Date(),
          },
        });

        await sendEmail({
          to: employee.email,
          subject: "Your Login Credentials",
          text: `
            Hello ${employee.first_name}!
            
            Your account has been created automatically.
            
            Your login credentials are:
            Username: ${username}
            Password: password
            
            Please keep these credentials safe and change your password upon first login.
            
            Best regards,
            HR Team
          `,
        });

        return {
          success: true,
          message: "Account created and credentials sent",
          updated: { newAccount: true }
        };
      }
      
      // For existing users, check what needs to be updated
      const updates = [];

      // Handle password reset
      if (!data.privilege_id) {
        const currentCredentials = await tx.auth_credentials.findFirst({
          where: { user_id: existingUser.id.toString() }
        });

        if (currentCredentials) {
          await tx.auth_credentials.update({
            where: { user_id: existingUser.id.toString() },
            data: {
              password: await new SimpleAES().encryptData("password"),
            },
          });

          await sendEmail({
            to: employee.email,
            subject: "Password Reset Notification",
            text: `
              Hello ${employee.first_name}!
              
              Your password has been reset to default.
              
              New Password: password
              
              Please change your password upon next login.
              
              Best regards,
              HR Team
            `,
          });

          updates.push("password reset");
        }
      }

      // Handle privilege update
      if (data.privilege_id) {
        const existingAccessControl = await tx.acl_user_access_control.findFirst({
          where: {
            OR: [{ employee_id: id }, { user_id: existingUser.id.toString() }]
          }
        });

        if (existingAccessControl) {
          await tx.acl_user_access_control.update({
            where: { id: existingAccessControl.id },
            data: {
              privilege_id: parseInt(data.privilege_id),
              update_at: new Date(),
            },
          });
        } else {
          await tx.acl_user_access_control.create({
            data: {
              employee_id: id,
              user_id: existingUser.id,
              privilege_id: parseInt(data.privilege_id),
              created_at: new Date(),
            },
          });
        }

        const privilege = await tx.sys_privileges.findUnique({
          where: { id: parseInt(data.privilege_id) }
        });

        if (privilege) {
          await sendEmail({
            to: employee.email,
            subject: "Access Level Update",
            text: `
              Hello ${employee.first_name}!
              
              Your access level has been updated to: ${privilege.name}
              
              Best regards,
              HR Team
            `,
          });
        }

        updates.push("privilege updated");
      }

      return {
        success: true,
        message: updates.length > 0 ? `Account ${updates.join(" and ")} successfully` : "No updates required",
        updated: {
          password: updates.includes("password reset"),
          privilege: updates.includes("privilege updated")
        }
      };

    } catch (error) {
      console.error("Account operation error:", error);
      throw error;
    }
  });
}