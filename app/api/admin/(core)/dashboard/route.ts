import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import {NextResponse} from "next/server";
import {employeeKpi} from "@/app/api/admin/(core)/dashboard/employee-kpi/employee-kpi";
import {DashboardKpis, PayrollKPI} from "@/types/dashboard/stats-types";
import prisma from "@/prisma/prisma";
import {toGMT8} from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic"
export async function GET() {
    try {

        const currentYear = new Date().getFullYear()
        const startDate = toGMT8(`${currentYear}-01-01`).toDate();
        const endDate = toGMT8(`${currentYear}-12-31`).toDate();
        const [employee_kpi, pendingLeaveCount, deployed_payroll_dates] = await Promise.all([
            employeeKpi(),
            prisma.trans_leaves.count({
                where: {
                    status: "pending"
                }
            }),
        prisma.trans_payroll_date.findMany({
            where: {
                is_processed: true,
                deleted_at: null,
                start_date: {
                    gte: startDate, // Start date is greater than or equal to the range start
                },
                end_date: {
                    lte: endDate, // End date is less than or equal to the range end
                }
            },
            select: {
                id: true,
                start_date: true,
                end_date: true
            },
            orderBy: {
                end_date: "desc",
            },
        })
        ]);

        const salary_net = await prisma.trans_payrolls.groupBy({
            by: ["date_id"],
            where: {
                date_id: {
                    in: deployed_payroll_dates.length > 0
                        ? deployed_payroll_dates.map((date) => date.id)
                        : undefined
                }
            },
            _sum: {
                gross_total_amount: true,
                deduction_total_amount: true,
            }
        });

        // console.log("Ids: ", deployed_payroll_dates);

        const payrollDetails:PayrollKPI[] = deployed_payroll_dates.length > 0
            ? deployed_payroll_dates.map((date) => {
                const aggregatedEntry = salary_net.find((entry) => entry.date_id === date.id);
                const total_gross = aggregatedEntry?._sum.gross_total_amount?.toNumber() ?? 0;
                const total_deduct = aggregatedEntry?._sum.deduction_total_amount?.toNumber() ?? 0;
                const payroll_date = toGMT8(date.end_date);
                const daysCovered = Number(payroll_date.format("DD"));
                const payroll_frequency = daysCovered < 16 ? "Semi-Monthly" : "Monthly";

                return {
                    month: payroll_date.month(),
                    year: payroll_date.format("YYYY"),
                    payroll_date: `${toGMT8(date.start_date).format("MMM DD")} - ${toGMT8(date.end_date).format("DD, YYYY")}`,
                    payroll_frequency: payroll_frequency,
                    gross_total_amount: total_gross.toFixed(2) || 0,
                    deduction_total_amount: total_deduct.toFixed(2) || 0,
                    net_salary: total_gross - total_deduct || 0,
                };
            })
            : [];
        const kpis: DashboardKpis = {
            employees_kpi: employee_kpi,
            leave_pending: pendingLeaveCount,
            payroll: payrollDetails
        };

        return NextResponse.json(kpis);
    } catch (err) {
        console.log("Error: ", err);
        return getPrismaErrorMessage(err);
    }
}

