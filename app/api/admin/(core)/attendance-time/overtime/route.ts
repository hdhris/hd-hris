import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { getPaginatedData } from "@/server/pagination/paginate";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {

    const overtimes = await prisma.trans_overtimes.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        trans_employees_overtimes: {
          ...emp_rev_include.employee_detail
        },
        trans_employees_overtimes_approvedBy: {
          ...emp_rev_include.reviewer_detail
        },
      },
    });

    const overtimesWithFullNames = overtimes.map((overtime) => {
      return {
        ...overtime,
        full_name: getEmpFullName(overtime.trans_employees_overtimes),
        approvedBy_full_name: getEmpFullName(
          overtime.trans_employees_overtimes_approvedBy
        ),
      };
    });

    return NextResponse.json(overtimesWithFullNames);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
