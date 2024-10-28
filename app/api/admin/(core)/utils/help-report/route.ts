import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");
    const report = await prisma.sys_help_report.findMany({
      where: {
        pathname: path,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        trans_employees_sys_help_report_reporter_idTotrans_employees: {
          select: {
            prefix: true,
            first_name: true,
            last_name: true,
            middle_name: true,
            suffix: true,
            extension: true,
            picture: true,
          },
        },
        trans_employees_sys_help_report_reviewer_idTotrans_employees: {
          select: {
            prefix: true,
            first_name: true,
            last_name: true,
            middle_name: true,
            suffix: true,
            extension: true,
            picture: true,
          },
        },
      },
    });
    return NextResponse.json(report);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
