import {NextResponse} from "next/server";
import {recoveryFormSchema} from "@/helper/zodValidation/EmailValidation";
import {z} from "zod";

export async function POST(req: Request) {
    try {
        if (req.headers.get('Content-Type')?.includes('application/json')) {
            const data = await req.json();
            const parsedData = recoveryFormSchema.parse(data);

            // Validate the parsed data
            if(!parsedData) {
                return NextResponse.json({ message: 'Validation error' }, { status: 400 });
            }

            // Process the validated data (e.g., update profile in database)
            // Example: await updateProfile(parsedData);

            return NextResponse.json({ message: 'Recovery email sent successfully'});
        } else {
            return NextResponse.json({ message: 'Unsupported Content-Type' }, { status: 400 });
        }
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
        } else {
            console.error("Internal server error:", error);
            return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
        }
    }
}