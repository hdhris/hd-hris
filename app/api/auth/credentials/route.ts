import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/lib/utils/sendEmail";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { username, password, userId, email } = await request.json();

    // Verify user exists in trans_users
    const user = await prisma.trans_users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Encrypt password
    const encryptedPassword = await new SimpleAES().encryptData(password);

    // Create credentials with proper relation to trans_users
    const credentials = await prisma.auth_credentials.create({
      data: {
        username,
        password: encryptedPassword,
        user_id: userId,
      },
    });

    // Send email with credentials
    await sendEmail({
      to: email,
      subject: "Your Login Credentials",
      text: `
        Hello! Your account has been created.
        
        Your login credentials are:
        Username: ${username}
        Password: ${password}
        
        Please keep these credentials safe.
      `,
    });

    return NextResponse.json(
      {
        message: "Credentials created",
        id: credentials.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating credentials:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            message: "Username already exists",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to create credentials",
      },
      { status: 500 }
    );
  }
}
