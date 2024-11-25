// app/api/employeemanagement/employees/create-with-credentials/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { Prisma } from "@prisma/client";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/lib/utils/sendEmail";

export async function POST(request: Request) {
  try {
    const { employee, credentials } = await request.json();

    if (!employee.email || !credentials?.username || !credentials?.password) {
      return NextResponse.json({
        message: "Email, username and password are required",
      }, { status: 400 });
    }

    // First create the user and get the user_id
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Create user
      const newUser = await prisma.trans_users.create({
        data: {
          name: employee.first_name,
          email: employee.email
        }
      });

      // 2. Create credentials
      const encryptedPassword = await new SimpleAES().encryptData(credentials.password);
      await prisma.auth_credentials.create({
        data: {
          username: credentials.username,
          password: encryptedPassword,
          user_id: newUser.id
        }
      });

      return newUser.id;
    });

    // Send email
    try {
      await sendEmail({
        to: employee.email,
        subject: "Your Login Credentials",
        text: `
          Hello ${employee.first_name}!
          
          Your account has been created successfully.
          
          Your login credentials are:
          Username: ${credentials.username}
          Password: ${credentials.password}
          
          Please keep these credentials safe and change your password upon first login.
          
          Best regards,
          HR Team
        `
      });
    } catch (emailError) {
    //   console.error("Failed to send email:", emailError);
    }

    // Return the user_id to be used in the employee creation
    return NextResponse.json({ userId: result }, { status: 201 });
  } catch (error) {
    // console.error("Transaction failed:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({
          message: "Username or email already exists",
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      message: "Failed to create user account",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}