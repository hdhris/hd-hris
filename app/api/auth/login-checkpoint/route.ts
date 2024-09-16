import {hasContentType} from "@/helper/content-type/content-type-check";
import {NextRequest, NextResponse} from "next/server";
import SimpleAES from "@/lib/cryptography/3des";
import {ChangeCredentialSchema} from "@/helper/zodValidation/ChangeCredentialValidation";
import prisma from "@/prisma/prisma";
import {ZodError} from "zod";
import {auth} from "@/auth";

export async function PUT(request: NextRequest) {
    try {
        hasContentType(request);

        const encrypt = new SimpleAES();
        const session = await auth()
        const account_id = session?.user?.id
        const data = await request.json();
        const validateCredentials = ChangeCredentialSchema.parse(data);

        // Encrypt the new password
        const password_encrypt = await encrypt.encryptData(validateCredentials.new_password);

        // Check if the username already exists in the database
        const existingAccount = await prisma.credentials.findFirst({
            where: {
                username: validateCredentials.username,
            }
        });

        // If the username already exists, return an error
        if (existingAccount) {
            return NextResponse.json({message: "Username already exists. Please choose a different one."}, {status: 400});
        }

        // Compare the encrypted passwords (not plaintext)


        // Find the account to update (this assumes you know the account to update based on something like a session)
        const accountToUpdate = await prisma.credentials.findFirst({
            where: {
                id: account_id,  // Adjust this ID as needed, perhaps dynamically from session
            }
        });

        // If the account does not exist, return an error
        if (!accountToUpdate) {
            return NextResponse.json({message: "Account not found"}, {status: 404});
        }

        const password_check = await encrypt.compare(validateCredentials.new_password, accountToUpdate.password);

        if (password_check) {
            return NextResponse.json({message: "Please enter different credentials"}, {status: 400});
        }

        // Update the account with the new username and encrypted password
        await prisma.credentials.update({
            where: {
                id: accountToUpdate.id,
            }, data: {
                username: validateCredentials.username, password: password_encrypt,
            }
        });


        return NextResponse.json({message: "Account updated successfully"}, {status: 200});

    } catch (error) {
        console.log(error);
        if (error instanceof ZodError) {
            return NextResponse.json({message: error.message}, {status: 400});
        }
        return NextResponse.json({message: "Something went wrong"}, {status: 500});
    }
}
