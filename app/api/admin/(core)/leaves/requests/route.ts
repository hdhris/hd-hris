import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic"
export async function GET() {
    const data = await prisma.trans_leaves.findMany({
        include: {
            trans_employees_leaves: {
                select: {
                    email: true,
                    prefix: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    suffix: true,
                    extension: true,
                    picture: true
                }
            }, trans_employees_leaves_approvedBy: {
                select: {
                    email: true,
                    prefix: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    suffix: true,
                    extension: true,
                    picture: true
                }
            }, ref_leave_types: true
        }
    });

    // const leaves_request = data.map((item) => {
    //     return {
    //         id: item.id!, ...item
    //     }
    // })

    return NextResponse.json(data)
}