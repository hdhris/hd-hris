import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { isEmployeeAvailable } from "@/helper/employee/unavailableEmployee";
import { toGMT8 } from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    try {
        const findEmployees = await prisma.trans_employees.findMany({
            where: {
                deleted_at: null,
            },
            select: {
                ...emp_rev_include.basic_detail.select,
            },
        });
        const filteredEmplyoees = findEmployees.filter((emp) => isEmployeeAvailable({employee:emp}));

        const last_evaluations = new Map(
            await Promise.all(
                filteredEmplyoees.map(async (employee) => {
                    const evaluations = await prisma.fact_performance_evaluations.findMany({
                        where: {
                            employee_id: employee.id,
                            ref_employment_status: {
                                trans_employees: {
                                    some: {
                                        id: employee.id,
                                    },
                                },
                            },
                        },
                        select: {
                            employee_id: true,
                            start_date: true,
                            end_date: true,
                            status: true,
                            phase: true,
                            id: true,
                        },
                        orderBy: {
                            created_at: "desc",
                        },
                    });

                    return [employee.id, evaluations] as [number, typeof evaluations]; // Return a key-value pair for Map
                })
            )
        );

        const today = toGMT8();
        const result = filteredEmplyoees.map((employee) => {
            const last_date = toGMT8(
                last_evaluations.get(employee.id)?.[0]?.end_date ?? employee?.hired_at ?? undefined
            );
            const diff_months = last_date.diff(
                today.subtract(employee?.ref_employment_status.appraisal_interval!, "months"),
                "month"
            );
            return {
                employee: employee,
                evaluation_history: last_evaluations.get(employee.id),
                next_interval: diff_months,
                start_date: last_date.toISOString(),
                end_date: last_date.add(employee?.ref_employment_status.appraisal_interval!, "months").toISOString(),
            };
        });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
