import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let idString = searchParams.get("id");
    const id = idString? Number(idString) : null
    const overtime = id? await prisma.trans_overtimes.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
    }) : null;
    const employees = await prisma.trans_employees.findMany({
      where: {
        deleted_at: null,
      },
      ...emp_rev_include.employee_detail,
    });
    
    return NextResponse.json({overtime,employees});
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data:" + error },
      { status: 500 }
    );
  }
}