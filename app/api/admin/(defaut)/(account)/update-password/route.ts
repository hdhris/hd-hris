import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";


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

            //TODO: check if the password is the same as the password in the database
            
            //Validate the current password

            // Validate the parsed data
            const parsedData = passwordSchema.parse(data);

            // Check if passwords match
            if (parsedData.new_password !== parsedData.confirm_password) {
                return NextResponse.json({ message: 'Passwords do not match' }, { status: 400 });
            }

            // Process the validated data (e.g., update password in database)
            // Example: await updatePassword(parsedData.new_password);

            return NextResponse.json({ message: 'Password updated successfully'});
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