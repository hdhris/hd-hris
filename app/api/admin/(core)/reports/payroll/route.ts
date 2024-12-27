import {NextRequest, NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {emp_rev_include} from "@/helper/include-emp-and-reviewr/include";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {
    EmployeePayroll, PayrollDeductionReport, PayrollEarningsReport, PayrollReports
} from "@/types/report/payroll/payroll";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const {searchParams} = new URL(req.url);
    const dateID = Number(searchParams.get("date"));

    try {
        if (!dateID) return NextResponse.json({status: 404});

        // Fetch dateInfo, payrolls, and breakdowns concurrently
        const [dateInfo, payrolls] = await Promise.all([prisma.trans_payroll_date.findFirst({where: {id: dateID}}), prisma.trans_payrolls.findMany({where: {date_id: dateID}}),]);

        // Return blank data if no payroll records found or dateID is deleted
        if (dateInfo?.deleted_at || payrolls.length === 0) {
            return NextResponse.json({
                payrolls: [], breakdowns: [], employees: [], earnings: [], deductions: [],
            });
        }

        const payrollMap = new Map(payrolls.map((pr) => [pr.employee_id, pr.id]))
        const breakdowns = await prisma.trans_payhead_breakdowns.findMany({
            where: {payroll_id: {in: Array.from(payrollMap.values())}},
        });

        // Fetch all employees linked to payrolls
        const payheadIDs = Array.from(new Set(breakdowns.map((bd) => bd.payhead_id!)));
        const employeeIDs = Array.from(payrollMap.keys());

        const [payheads, employees] = await Promise.all([prisma.ref_payheads.findMany({
            where: {id: {in: payheadIDs}}, orderBy: {created_at: "asc"},
        }), prisma.trans_employees.findMany({
            where: {id: {in: employeeIDs}}, select: {
                ...emp_rev_include.employee_detail.select,
            },
        }),])

        const earnings: PayrollEarningsReport[] = payheads.filter((p) => p.type === "earning")
            .map(item => ({
                payhead_id: item.id, type: item.type ?? "", name: item.name ?? ""
            }));
        const deductions: PayrollDeductionReport[] = payheads.filter((p) => p.type === "deduction")
            .map(item => ({
                payhead_id: item.id, type: item.type ?? "", name: item.name ?? ""
            }));

        const emp: EmployeePayroll[] = employees.map(item => ({
            id: item.id,
            name: getEmpFullName(item),
            department: item.ref_departments?.name ?? "",
            job: item.ref_job_classes?.name ?? ""
        }))

        const payroll_reports: PayrollReports = {
            employees: emp, payroll: payrolls.map(payroll => ({
                payroll_id: payroll.id,
                employee_id: payroll.employee_id,
                gross_total_amount: payroll.gross_total_amount?.toNumber() || 0,
                deduction_total_amount: payroll.deduction_total_amount?.toNumber() || 0,
                date_id: payroll.date_id!,
            })),
            breakdown: breakdowns.map(breakdown => ({
                payroll_id: breakdown.payroll_id!,
                payhead_id: breakdown.payhead_id!,
                amount: breakdown.amount?.toNumber() || 0,
                id: breakdown.id
            })),
            deductions: deductions.map(deduction => ({
                payhead_id: deduction.payhead_id,
                name: deduction.name,
                type: deduction.type,
            })),
            earnings: earnings.map(earnings => ({
                payhead_id: earnings.payhead_id,
                name: earnings.name,
                type: earnings.type,
            }))
        }

        const date_id = Object.groupBy(payroll_reports.payroll, (payroll) => payroll["date_id"])
        // const filteredData = Object.values(date_id)
        //     .flatMap(item => item)
        //     .filter(dataItem =>
        //         if(payroll_reports.breakdown.some(breakdown => breakdown.payroll_id === dataItem?.id)){
        //
        //         }
        //     )

        return NextResponse.json({payroll_reports}, {status: 200});

    } catch (error) {
        return NextResponse.json({error: error}, {status: 500});
    }
}
