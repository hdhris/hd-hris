import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { generateEmailBody } from "@/helper/email/email";
import { sendEmail } from "@/services/email-services";
import { getSignatory } from "@/server/signatory";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const employee_id = Number(searchParams.get("employee_id"));
    try {
        const overtimes = await prisma.trans_overtimes.findMany({
            where: {
                employee_id,
                deleted_at: null,
                status: {
                    not: "rejected",
                },
                // date: {
                //     gte: toGMT8().toISOString(),
                // },
            },
            // select: {
            //     clock_in: true,
            //     clock_out: true,
            //     date: true,
            // },
        });
        return NextResponse.json(overtimes);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        console.log(body);
        // return NextResponse.json({ status: 200 });
        const evaluators = await getSignatory({
            path: "/overtime/requests",
            applicant_id: body.employee_id,
            is_auto_approved: false,
        });
        if (!evaluators) {
            return NextResponse.json({ status: 400 });
        }
        const applicant = evaluators.users.find((user) => user.id === body.employee_id);
        await Promise.all([
            prisma.trans_overtimes.create({
                data: {
                    ...body,
                    status: evaluators.evaluators.every((ev) => ev.decision) ? "approved" : "pending",
                    evaluators,
                    created_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                },
            }),
            ...(!!applicant
                ? [
                      sendEmail({
                          to: String(applicant.email),
                          subject: "Submission of Your Overtime Application",
                          html: await generateEmailBody({
                              name: applicant.name,
                              message: `${"Thank you for submitting your overtime application. We wanted to inform you that your request has been successfully received and is currently under review by the HR team."}\n You will be notified of any updates regarding your application via email or through our employee app. We aim to process overtime requests promptly and will ensure you are informed of the outcome as soon as possible.`,
                          }),
                      }),
                  ]
                : []),
        ]);
        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to post data: " + error }, { status: 500 });
    }
}
