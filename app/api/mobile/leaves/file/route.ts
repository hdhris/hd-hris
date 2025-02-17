import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { generateEmailBody } from "@/helper/email/email";
import { sendEmail } from "@/services/email-services";
import { getSignatory } from "@/server/signatory";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const employee_id = Number(searchParams.get("employee_id"));
    try {
        const LeaveBalance = await prisma.dim_leave_balances.findMany({
            where: {
                employee_id: employee_id,
            },
            include: {
                trans_leave_types: {
                    include: {
                        ref_leave_type_details: true,
                        trans_leaves: {
                            where: {
                                employee_id,
                            },
                        },
                    },
                },
            },
        });
        return NextResponse.json(LeaveBalance);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        console.log(body);
        const [evaluators,leave_type_audit] = await Promise.all([
            getSignatory({
                path:"/leaves/leave-requests", applicant_id: body.employee_id}),
            prisma.ref_leave_type_details.findFirst({
                where: {
                    id: body.id,
                }
            })
        ])

        if(!evaluators){
            return NextResponse.json({ status: 400 });
        }

        const [leaveApplication, employeeInfo] = await Promise.all([
            prisma.trans_leaves.create({
                data: {
                    ...body,
                    evaluators,
                    leave_type_audit,
                    created_by: body.employee_id,
                    created_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                    files: ['https://i.kym-cdn.com/entries/icons/facebook/000/050/187/4541e987-5d55-421f-968d-04f99fb6a68c-1702995843784.jpg'],
                },
            }),
            prisma.trans_employees.findFirst({
                where: { id: body.employee_id },
                select: {
                    last_name: true, email: true,
                }
            })
        ])
        await sendEmail({
            to: String(employeeInfo?.email), subject: "Submission of Your Leave Application", html: await generateEmailBody({
                name: String(employeeInfo?.last_name),
                message: 
                    `${'Thank you for submitting your leave application. We wanted to inform you that your request has been successfully received and is currently under review by the HR team.'
                    }\n You will be notified of any updates regarding your application via email or through our employee app. We aim to process leave requests promptly and will ensure you are informed of the outcome as soon as possible.`
            })
        })
        return NextResponse.json( { leaveApplication }, { status: 200 });
    } catch (error) {
        console.error("Error:", error); // Log the error for debugging
        return NextResponse.json({ error: "Failed to post data: " + error }, { status: 500 });
    }
}