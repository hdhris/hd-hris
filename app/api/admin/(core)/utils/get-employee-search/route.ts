import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { Prisma } from "@prisma/client";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";


export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const employees = await prisma.trans_employees.findMany({
      where: {
        deleted_at: null,
      },
      ...emp_rev_include.employee_detail,
    })
      return NextResponse.json(employees,{ status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
