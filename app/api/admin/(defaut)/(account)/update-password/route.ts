import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import Simple3Des from "@/lib/cryptography/3des";
import prisma from "@/prisma/prisma";
import {auth, signOut} from "@/auth";


const passwordSchema = z.object({
    current_password: z.string().min(8, "Password must be at least 8 characters long"),
    new_password: z.string().min(8, "Password must be at least 8 characters long"),
    confirm_password: z.string().min(8, "Password must be at least 8 characters long")
});


export async function PUT(req: NextRequest) {
    try {
        // Check if the request is JSON
        if (req.headers.get('Content-Type')?.includes('application/json')) {
            const data = await req.json();

            //get the session id
            const sessionId = await auth()

            //Get the password from the database
            const db_password = await prisma.sys_accounts.findFirst({
                select: {
                    password: true
                }, where: {
                    id: Number(sessionId?.user.id)
                }

            })
            //Decrypt the password from the database
            const des = new Simple3Des();
            const password = des.decryptData(db_password?.password!);


            //Validate the current password

            // Validate the parsed data
            const parsedData = passwordSchema.parse(data);
            //TODO: check if the password is the same as the password in the database
            if (parsedData.current_password !== password || parsedData.new_password === password && parsedData.confirm_password === password) {
                return NextResponse.json({message: 'Invalid password'}, {status: 400});
            }

            // Check if passwords match
            if (parsedData.new_password !== parsedData.confirm_password) {
                return NextResponse.json({message: 'Passwords do not match'}, {status: 400});
            }

            // Encrypt the new password
            const encrypt = new Simple3Des().encryptData(parsedData.new_password);

            const updatePassword = await prisma.sys_accounts.update({
                where: {
                    id: Number(sessionId?.user.id)
                },
                data: {
                    password: encrypt
                }
            })

            if(!updatePassword) {
                return NextResponse.json({message: 'Password not updated'}, {status: 400});

            } else {
                return NextResponse.json({message: 'Password updated successfully'});
            }
            // Process the validated data (e.g., update password in database)

            // Example: await updatePassword(parsedData.new_password);
        } else {
            return NextResponse.json({message: 'Unsupported Content-Type'}, {status: 400});
        }
    } catch (error: any) {
        // Handle validation errors or any other errors
        if (error instanceof z.ZodError) {
            return NextResponse.json({message: 'Validation error', errors: error.errors}, {status: 400});
        } else {
            console.error("Internal server error:", error); // Log the error for debugging
            return NextResponse.json({message: 'Internal server error', error: error.message}, {status: 500});
        }
    }
}