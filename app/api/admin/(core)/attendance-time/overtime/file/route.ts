import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getSignatory } from "@/server/signatory";
import { sendEmail } from "@/services/email-services";
import { generateEmailBody } from "@/helper/email/email";
import { objectExcludes } from "@/helper/objects/filterObject";

export async function GET(request: Request) {
    try {
        const overtimes = await prisma.trans_overtimes.findMany({
            where: {
                deleted_at: null,
                trans_employees_overtimes: {
                    deleted_at: null,
                },
                status: { not: "rejected" },
                date: {
                    gte: toGMT8().toISOString(),
                },
            },
            orderBy: {
                updated_at: "desc",
            },
            select: {
                employee_id: true,
                clock_in: true,
                clock_out: true,
                date: true,
            },
        });

        return NextResponse.json(overtimes);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const data = await req.json();

    try {
        // console.log(data,empId,approverId);
        const evaluators = await getSignatory({
            path:"/overtime/requests", applicant_id: data.employee_id, is_auto_approved:data.is_auto_approved});
        if (!evaluators) {
            return NextResponse.json({ status: 400 });
        }
        const [overtimeApplication, employeeInfo] = await Promise.all([
            prisma.trans_overtimes.create({
                data: {
                    ...(objectExcludes(data, ["is_auto_approved"]) as any),
                    status: data.is_auto_approved? "approved" : "pending",
                    evaluators: evaluators as any,
                    requested_mins: toGMT8(data.clock_out).diff(toGMT8(data.clock_in), "minutes"),
                    created_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                },
            }),
            prisma.trans_employees.findFirst({
                where: { id: data.employee_id },
                select: {
                    last_name: true,
                    email: true,
                },
            }),
        ]);
        await sendEmail({
            to: String(employeeInfo?.email),
            subject: "Filing of Your Overtime Application",
            html: await generateEmailBody({
                name: String(employeeInfo?.last_name),
                message: `We wanted to inform you inform you about the status of the overtime request submitted to the HR team.\n 
                ${
                    data.is_auto_approved
                        ? "Your overtime request has been successfully approved. You may proceed with your tasks as planned."
                        : "Your overtime request is currently under review by the HR team. You will be notified of any updates regarding your application via email or through our employee app. We aim to process overtime requests promptly and will ensure you are informed of the outcome as soon as possible."
                }`,
            }),
        });

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
