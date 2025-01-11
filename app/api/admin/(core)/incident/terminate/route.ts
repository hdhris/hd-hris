import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { addUnavailability } from "@/helper/employee/unavailableEmployee";
import { emp_rev_include, MinorEmployee } from "@/helper/include-emp-and-reviewr/include";

export async function POST(req: NextRequest) {
    const { employee_id, initiated_by, start_date, reason, incident_id } = await req.json();
    try {
        const [employee, initiator] = await Promise.all([
            prisma.trans_employees.findFirst({
                where: { id: Number(employee_id) },
                select: { termination_json: true, id: true },
            }),
            prisma.trans_employees.findFirst({
                where: { id: Number(initiated_by) },
                ...emp_rev_include.minor_detail,
            }),
        ]);

        if (!employee || !initiator) throw new Error("No employee found");

        const termination_json = addUnavailability({
            entry: employee.termination_json,
            start_date,
            end_date: null,
            initiated_by: initiator as any as MinorEmployee,
            reason,
            incident_id,
        });

        await prisma.$transaction(async (psm) => {
            await Promise.all([
                psm.trans_employees.update({
                    where: { id: employee.id },
                    data: { termination_json },
                }),
                psm.dim_incident_reports.update({
                    where: { id: Number(incident_id) },
                    data: { is_acted: true },
                }),
            ]);
        });

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error("Error:", error); // Log the error for debugging
        return NextResponse.json({ error: "Failed to post data: " + error }, { status: 500 });
    }
}
