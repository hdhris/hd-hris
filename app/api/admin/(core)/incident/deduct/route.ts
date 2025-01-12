import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { addUnavailability } from "@/helper/employee/unavailableEmployee";
import { emp_rev_include, MinorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { static_formula } from "@/helper/payroll/calculations";

export async function POST(req: NextRequest) {
    const { employee_id, amount, incident_id } = await req.json();
    try {
        const payhead = await prisma.ref_payheads.findFirst({
            where: {
                calculation: static_formula.payable,
            },
            select: {
                id: true,
            }
        })

        if (!payhead) throw new Error("No payhead found");

        await prisma.$transaction(async (psm) => {
            await Promise.all([
                psm.trans_payable.create({
                    data: {
                        amount: Number(amount),
                        employee_id: Number(employee_id),
                        payhead_id: payhead.id,
                    }
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
