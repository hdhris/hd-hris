import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req);
        const data = await req.json();

        // Fetch the last order number for the signatory path
        const lastOrder = await prisma.trans_signatories.findMany({
            where: {
                signatory_path_id: data.id
            },
            select: {
                order_number: true
            }
        });

        const addOrder = lastOrder && lastOrder.length > 0 && lastOrder[lastOrder.length - 1].order_number
            ? lastOrder[lastOrder.length - 1].order_number + 1
            : 1;


        // Create a new signatory order
        await prisma.trans_signatories.create({
            data: {
                order_number: addOrder,
                job_id: Number(data.job),
                is_apply_to_all_signatory: data.is_apply_to_all_signatories,
                signatory_role_id: Number(data.role),
                signatory_path_id: data.id
            }
        });

        return NextResponse.json({success: true});
    } catch (error: any) {
        console.error('Error occurred during POST request:', error); // Log the error for debugging
        return NextResponse.json(
            { error: error.message || 'Internal Server Error', details: error.stack },
            { status: 500 }
        );
    }
}
