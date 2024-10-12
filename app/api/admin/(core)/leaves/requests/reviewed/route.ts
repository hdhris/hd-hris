import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import {auth} from "@/auth";
import {revalidatePath, revalidateTag} from "next/cache";

export async function POST(req: NextRequest) {
    try {
        hasContentType(req);
        const data = await req.json();

        const session = await auth()
        console.log(session)

        const reviewer = await prisma.trans_employees.findUnique({
            where: {
                email: session?.user.email!
            }, select: {
                id: true
            }
        })

        if(!reviewer) {
            return NextResponse.json({success: false})
        }
        if (data.method === "Approved") {
            await prisma.trans_leaves.update({
                where: {
                    id: data.id
                }, data: {
                    status: "Approved",
                    approval_at: new Date(),
                    approved_by: reviewer.id
                }
            })
            revalidatePath("/admin/leaves/requests")
            return Response.json({revalidated: true, success: true})
        } else if (data.method === "Rejected") {
            await prisma.trans_leaves.update({
                where: {
                    id: data.id
                }, data: {
                    status: "Rejected",
                    approval_at: new Date(),
                    approved_by: reviewer.id
                }
            })
            revalidatePath("/admin/leaves/requests")
            return NextResponse.json({revalidated: true, success: true})
        }
        return NextResponse.json({success: false})

    } catch (e) {
        console.error(e)
        return NextResponse.json({success: false})
    }
}