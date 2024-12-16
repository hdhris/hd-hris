import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        let idString = searchParams.get("id");
        const id = idString ? Number(idString) : null;
        const [payhead, employees, departments, job_classes, employement_status] = await Promise.all([
            id
                ? prisma.ref_payheads.findFirst({
                      where: {
                          id: id,
                          deleted_at: null,
                      },
                      include: {
                        dim_payhead_specific_amounts: true,
                      }
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
                },
                select: {
                    id: true,
                    name: true,
                },
            }),
            prisma.ref_employment_status.findMany({
                where: {
                    deleted_at: null,
                }
            })
        ]);
        if (payhead) {
            return NextResponse.json({ payhead, employees, departments, job_classes, employement_status });
        } else {
            return NextResponse.json({ employees, departments, job_classes, employement_status });
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data:" + error }, { status: 500 });
    }
}
