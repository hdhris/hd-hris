import {NextRequest, NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {emp_rev_include} from "@/helper/include-emp-and-reviewr/include";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {
    EmployeePayroll, PayrollDeductionReport, PayrollEarningsReport, PayrollReports
} from "@/types/report/payroll/payroll";
import {toGMT8} from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic";

export async function GET() {

    try {
        const payroll_date = await prisma.trans_payroll_date.findMany({
            where: {
                is_processed: true
            },
            select: {
                id: true,
                start_date: true,
                end_date: true
            }
        })

        const date = payroll_date.map(item => ({
            id: item.id,
            date: `${toGMT8(item.start_date).format("MMM DD, YYYY")} - ${toGMT8(item.end_date).format("MMM DD, YYYY")}`
        }))
        return NextResponse.json(date, {status: 200});

    } catch (error) {
        return NextResponse.json({error: error}, {status: 500});
    }
}
