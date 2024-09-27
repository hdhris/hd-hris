import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/prisma/prisma";
import { auth } from "@/auth";
import SimpleAES from "@/lib/cryptography/3des";
import {hasContentType} from "@/helper/content-type/content-type-check";

const passwordSchema = z.object({
    current_password: z.string().min(8, "Password must be at least 8 characters long"),
    new_password: z.string().min(8, "Password must be at least 8 characters long"),
    confirm_password: z.string().min(8, "Password must be at least 8 characters long")
});

export async function PUT(req: NextRequest) {
    try {
        hasContentType(req) // checks the content type if false it will return a response otherwise pass
        const data = await req.json();

        // Get the session ID
        const sessionId = await auth();
        const userId = sessionId?.user;

        // Retrieve the user's current password from the database
        const dbPassword = await prisma.account.findUnique({
            select: { password: true },
            where: {
                provider_providerAccountId: {
                    provider: "credential", // Ensure this matches your Prisma schema
                    providerAccountId: userId?.id!
                }
            }
        });

        if (!dbPassword) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Validate the parsed data
        const parsedData = passwordSchema.parse(data);

        // Initialize SimpleAES instance
        const des = new SimpleAES();

        // Check if the current password matches
        const isCurrentPasswordMatch = await des.compare(parsedData.current_password, dbPassword.password!);
        if (!isCurrentPasswordMatch) {
            return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
        }

        // Check if the new password and confirm password match
        const isNewPasswordMatch = parsedData.new_password === parsedData.confirm_password;
        if (!isNewPasswordMatch) {
            return NextResponse.json({ message: 'New password and confirm password do not match' }, { status: 400 });
        }

        // Check if the new password is different from the current password
        const isNewPasswordDifferent = !await des.compare(parsedData.new_password, dbPassword.password!);
        if (!isNewPasswordDifferent) {
            return NextResponse.json({ message: 'New password must be different from the current password' }, { status: 400 });
        }

        // Encrypt the new password and update it in the database
        const encryptedPassword = await des.encryptData(parsedData.new_password);
        const updateResult = await prisma.account.update({
            where: {
                provider_providerAccountId: {
                    provider: "credential", // Ensure this matches your Prisma schema
                    providerAccountId: userId?.id!
                }
            },
            data: {
                password: encryptedPassword
            }
        });

        if (!updateResult) {
            return NextResponse.json({ message: 'Password not updated' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Password updated successfully' });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
        } else {
            console.error("Internal server error:", error); // Log the error for debugging
            return NextResponse.json({ message: 'Internal server error', error: error }, { status: 500 });
        }
    }
}
