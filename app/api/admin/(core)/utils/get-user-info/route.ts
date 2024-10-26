import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("userID");
    const userInfo = await prisma.trans_employees.findFirst({
      where : {
        id: Number(userID),
      },
      ...emp_rev_include.employee_detail
    })
    return NextResponse.json(userInfo);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
