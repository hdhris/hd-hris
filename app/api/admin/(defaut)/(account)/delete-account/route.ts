import {NextResponse} from "next/server";
import {z} from "zod";
import {PasswordValidation} from "@/helper/zodValidation/PasswordValidation";

export async function DELETE(req: Request) {
    try {
        // Check if the request is JSON
        if (req.headers.get('Content-Type')?.includes('application/json')) {
            const data = await req.json();

            // compare the passwords to the passwords in the database
            //WARNING: THIS IS FOR TESTING ONLY
            //TODO: REMOVE AND CHANGE IT BASED ON THE DATABASE
            const password = 'adminadmin'
            // Validate the parsed data
            const parsedData = PasswordValidation.parse(data);

            // Check if passwords match
            if (parsedData.password !== password) {
                return NextResponse.json({ message: 'Cannot delete account' }, { status: 400 });
            }

            //TODO: insert deactivate date into database

            return NextResponse.json({ message: 'Account successfully deleted' });
        } else {
            return NextResponse.json({ message: 'Unsupported Content-Type' }, { status: 400 });
        }
    } catch (error: any) {
        // Handle validation errors or any other errors
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
        } else {
            console.error("Internal server error:", error); // Log the error for debugging
            return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
        }
    }
}