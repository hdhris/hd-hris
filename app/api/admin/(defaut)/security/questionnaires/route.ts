import {NextRequest, NextResponse} from "next/server";
import {updateProfileSchema} from "@/helper/zodValidation/UpdateProfile";
import {z} from "zod";
import {questionnairesFormSchema} from "@/helper/zodValidation/SecurityQuestions";

const questionnairesArraySchema = z.array(questionnairesFormSchema);
export async function POST(req: NextRequest) {
    try {
        if (req.headers.get('Content-Type')?.includes('application/json')) {
            const data = await req.json();

            const parsedData = questionnairesArraySchema.safeParse(data);

            // Validate the parsed data
            if(!parsedData) {
                return NextResponse.json({ message: 'Validation error' }, { status: 400 });
            }

            // Process the validated data (e.g., update profile in database)
            // Example: await updateProfile(parsedData);

            //INFO: THIS RETURNS [{questions: "hi", answers: "hello"}]
            //ADD IT IN THE DATABASE
            return NextResponse.json({ message: 'Questionnaires successfully added'});
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