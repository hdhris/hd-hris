import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { generateEmailBody } from "@/helper/email/email";
import { sendEmail } from "@/services/email-services";

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
        const [leaveApplication, employeeInfo] = await Promise.all([
            prisma.trans_leaves.create({
                data: {
                    ...body,
                    evaluators,
                    created_by: body.employee_id,
                    created_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                    files: ['https://i.kym-cdn.com/entries/icons/facebook/000/050/187/4541e987-5d55-421f-968d-04f99fb6a68c-1702995843784.jpg'],
                },
            }),
            prisma.trans_employees.findFirst({
                where: { id: body.employee_id },
                ...emp_rev_include.employee_detail,
            })
        ])
        await sendEmail({
            to: String(employeeInfo?.email),
            subject: "Submission of Your Leave Application",
            html: await generateEmailBody({
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

const evaluators = {
    users: [
        {
            id: "918bc7f9-3ccd-4e67-826e-709718332fc3",
            name: "Cuello, John Rey",
            role: "approver",
            email: "johnreycuello2@gmail.com",
            picture:
                "https://img.freepik.com/free-photo/portrait-young-handsome-businessman-wearing-suit-standing-with-crossed-arms-with-isolated-studio-white-background_1150-63219.jpg?t=st=1730875405~exp=1730879005~hmac=74c3e9b73f3b8e12a79b50f93fffb6031b7d8eea8620f97444241c47bb854f9f&w=996",
            employee_id: 66,
        },
        {
            id: "53254930-39e1-4c4d-8754-7f82a0a6de0b",
            name: "Datumanong, Muhammad Nizam",
            role: "reviewer",
            email: "ndatumanong05@gmail.com",
            picture:
                "https://files.edgestore.dev/6bc0cgi3ynpz46db/publicFiles/_public/72b8b592-e919-4f88-af00-6966a6f1ca7c.jpg",
            employee_id: 2,
        },
        {
            id: "de006f67-38a2-4331-8785-7a8ebce69efc",
            name: "Pacquiao, Manny P.",
            role: "applicant",
            email: "manny@gmail.com",
            picture:
                "https://files.edgestore.dev/6bc0cgi3ynpz46db/publicFiles/_public/67866a2c-0df9-4b17-a984-cef72d0609a8.png",
            employee_id: 160,
        },
    ],
    approver: {
        decision: {
            is_approved: true,
            decisionDate: null,
            rejectedReason: null,
        },
        approved_by: "918bc7f9-3ccd-4e67-826e-709718332fc3",
    },
    comments: [],
    reviewers: {
        decision: {
            is_reviewed: true,
            decisionDate: "2024-12-11T09:08:31.432Z",
            rejectedReason: null,
        },
        reviewed_by: "53254930-39e1-4c4d-8754-7f82a0a6de0b",
    },
};
