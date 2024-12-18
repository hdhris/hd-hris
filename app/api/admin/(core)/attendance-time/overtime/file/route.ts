import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getSignatory } from "@/server/signatory";
import { sendEmail } from "@/services/email-services";
import { generateEmailBody } from "@/helper/email/email";

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
    const { data, is_auto_approved, files } = await req.json();

    try {
        // console.log(data,empId,approverId);
        const evaluators = await getSignatory("/overtime/requests", data.employee_id, is_auto_approved);
        if (!evaluators) {
            return NextResponse.json({ status: 400 });
        }
        const [overtimeApplication, employeeInfo] = await Promise.all([
            prisma.trans_overtimes.create({
                data: {
                    ...data,
                    evaluators,
                    created_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                    // files: ['https://i.kym-cdn.com/entries/icons/facebook/000/050/187/4541e987-5d55-421f-968d-04f99fb6a68c-1702995843784.jpg'],
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
            subject: "Submission of Your Overtime Application",
            html: await generateEmailBody({
                name: String(employeeInfo?.last_name),
                message: `${"Thank you for submitting your overtime application. We wanted to inform you that your request has been successfully received and is currently under review by the HR team."}\n You will be notified of any updates regarding your application via email or through our employee app. We aim to process overtime requests promptly and will ensure you are informed of the outcome as soon as possible.`,
            }),
        });

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Failed to post data" }, { status: 500 });
    }
}
