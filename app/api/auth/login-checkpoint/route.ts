import {hasContentType} from "@/helper/content-type/content-type-check";
import {NextRequest, NextResponse} from "next/server";
import {ChangeCredentialSchema} from "@/helper/zodValidation/ChangeCredentialValidation";
import prisma from "@/prisma/prisma";
import SimpleAES from "@/lib/cryptography/3des";
import {ZodError} from "zod";
import {auth, signIn} from "@/auth";

export async function PUT(request: NextRequest) {
    try {
        hasContentType(request);

        const encrypt = new SimpleAES();

        // Parse and validate the request body
        const data = await request.json();
        const validateCredentials = ChangeCredentialSchema.parse(data);

        // Get the current user session
        const session = await auth();
        const account_id = session?.user?.id;

        if (!account_id) {
            return NextResponse.json({message: "User not authenticated"}, {status: 401});
        }

        // Encrypt the new password
        const password_encrypt = await encrypt.encryptData(validateCredentials.new_password);

        // Find account by username
        const existingAccount = await prisma.auth_credentials.findUnique({
            where: {
               user_id: account_id
            }
        });

        // if username does not already exist
        if (existingAccount?.username === validateCredentials.username) {
            // If the username already exists
            return NextResponse.json({message: "Username already exists"}, {status: 400});
        }
        //
        // // Check if the current password matches
        const currentPasswordMatches = await encrypt.compare(validateCredentials.new_password, existingAccount?.password!);
        if (currentPasswordMatches) {
            return NextResponse.json({message: "Please enter a different password"}, {status: 400});
        }

        await prisma.auth_credentials.update({
            where: {
                user_id: account_id
            }, data: {
                username: validateCredentials.username, password: password_encrypt
            }
        });

        return NextResponse.json({message: "Account updated successfully"}, {status: 200});

    } catch (error) {
        console.error(error);
        if (error instanceof ZodError) {
            return NextResponse.json({message: error.message}, {status: 400});
        }
        return NextResponse.json({message: "Something went wrong"}, {status: 500});
    }
}
