import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        let idString = searchParams.get("id");
        const id = idString ? Number(idString) : null;
        const [payhead, employees, departments, job_classes, amount_records] = await Promise.all([
            id
                ? prisma.ref_payheads.findFirst({
                      where: {
                          id: id,
                          deleted_at: null,
                      },
                  })
                : null,
            prisma.trans_employees.findMany({
                where: {
                    deleted_at: null,
                },
                select: {
                    ...emp_rev_include.employee_detail.select,
                },
            }),
            prisma.ref_departments.findMany({
                where: {
                    deleted_at: null,
                    is_active: true,
                },
                select: {
                    id: true,
                    name: true,
                },
            }),
            prisma.ref_job_classes.findMany({
                where: {
                    deleted_at: null,
                    is_active: true,
                    ref_departments: {
                        deleted_at: null,
                        is_active: true,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    department_id: true,
                },
            }),
            prisma.dim_payhead_specific_amounts.findMany({
                where: {
                    payhead_id: id,
                },
            }),
        ]);
        if (payhead) {
            return NextResponse.json({ payhead, employees, departments, job_classes, amount_records });
        } else {
            return NextResponse.json({ employees, departments, job_classes });
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data:" + error }, { status: 500 });
    }
}
