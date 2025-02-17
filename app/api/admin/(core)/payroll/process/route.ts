import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const employees = await prisma.trans_employees.findMany({
        where : {
            deleted_at: null,
        },
        ...emp_rev_include.employee_detail
    })
    return NextResponse.json({employees});
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
