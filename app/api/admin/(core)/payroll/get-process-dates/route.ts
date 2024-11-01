import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const pr_dates = await prisma.trans_payroll_date.findMany({
        where: {
            deleted_at:null,
        },
        orderBy: {
          start_date: 'desc', // Sort by start_date in descending order
        },
      });
    return NextResponse.json(pr_dates);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
