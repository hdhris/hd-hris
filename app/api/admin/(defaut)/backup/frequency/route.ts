import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";


const frequencySchema = z.object({
    backupFrequency: z.enum(['off', 'daily', 'weekly', 'monthly'], {
        message: 'Error'
    }),
    backupTime: z.string().refine((time) => {
        // Define a regular expression to match the structure 'h:mm AM/PM'
        const timeRegex = /^([1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;

        // Test if the input matches the regex
        return timeRegex.test(time);
    }, {
        message: "Invalid time format. Expected 'h:mm AM/PM'.",
    })
})
export async function PUT(req: NextRequest){
    try {
        if (req.headers.get('Content-Type')?.includes('application/json')) {
            const data = await req.json();
            const parsedData = frequencySchema.parse(data);

            // Validate the parsed data
            if(!parsedData) {
                return NextResponse.json({ message: 'Validation error' }, { status: 400 });
            }

            // Process the validated data (e.g., update profile in database)
            // Example: await updateProfile(parsedData);

            return NextResponse.json({ message: 'Backup Frequency successfully applied'});
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