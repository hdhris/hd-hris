import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import {Comment, Evaluations} from "@/types/leaves/leave-evaluators-types";
import {processJsonObject} from "@/lib/utils/parser/JsonObject";
import {InputJsonValue} from "@prisma/client/runtime/library";
import {sendEmail} from "@/services/email-services";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req);

        const data = await req.json();

        console.log("Data Reply: ", data)
        // Retrieve the evaluation data
        const evaluation = await prisma.trans_leaves.findUnique({
            where: {
                id: data.leave_id, // Replace with dynamic ID as needed
            }, select: {
                evaluators: true,
            },
        });

        // Parse the evaluators JSON into Evaluations type
        const evaluationComment = processJsonObject<Evaluations>(evaluation?.evaluators);

        if (!evaluationComment) {
            throw new Error("No evaluation data found");
        }

        // Create a new comment object
        // const newComment: Comment = {
        //     id: evaluationComment.comments.length + 1, // Incremental ID
        //     author: "2", // Assuming user ID 2 is the author
        //     timestamp: new Date().toISOString(),
        //     message: "This application looks great!",
        //     replies: [],
        // };

        // Inject the new comment into the comments array
        // evaluationComment.comments.push(data);
        evaluationComment.comments.filter(item => item.id === data.id)[0].replies.push(data.replies[0]);

        // Optionally update the database (if needed)
        await prisma.trans_leaves.update({
            where: {
                id: data.leave_id, // Match the same ID as above
            }, data: {
                evaluators: evaluationComment as unknown as InputJsonValue, // Save updated evaluators
            },
        });

        const from = evaluationComment.users.find(item => item.id === data.author)?.name!
        await sendEmail({
            to: data.applicant_email,
            subject: "Leave Request Reply",
            text: `You have received a reply from ${from} regarding to your leave request. Please check your request for more details.`,
        })

        return NextResponse.json({
            success: true, message: "Comment added successfully",
        });
    } catch (error) {
        console.log("Error: ", error);
        return NextResponse.json({
            success: false, message: "Unable to upsert a comment. Try again.",
        }, {status: 500});
    }
}
