import {NextRequest, NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {sendEmail} from "@/services/email-services";
import {generateEmailBody} from "@/helper/email/email";

export async function POST(req: NextRequest) {
    const {employee_id, message, incident_id} = await req.json();
    try {
        const [employee, incident] = await Promise.all([prisma.trans_employees.findFirst({
            where: {
                id: Number(employee_id),
            }, select: {
                last_name: true, email: true,
            }
        }),

            prisma.dim_incident_reports.findFirst({
                where: {
                    id: Number(incident_id),
                }, select: {
                    type: true,
                },
            })])
        if (!employee || !incident) throw new Error("Not found");

        await prisma.$transaction(async (psm) => {
            await Promise.all([sendEmail({
                to: String(employee?.email),
                subject: `Warning Notice: ${incident.type}`,
                html: await generateEmailBody({
                    name: String(employee?.last_name), message,
                }),
            }), psm.dim_incident_reports.update({
                where: {id: Number(incident_id)}, data: {is_acted: true},
            }),]);
        });

        return NextResponse.json({status: 200});
    } catch (error) {
        console.error("Error:", error); // Log the error for debugging
        return NextResponse.json({error: "Failed to post data: " + error}, {status: 500});
    }
}
