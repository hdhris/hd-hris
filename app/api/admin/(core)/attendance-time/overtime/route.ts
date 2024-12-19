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
        trans_employees_overtimes: {
          deleted_at: null,
        }
      },
      orderBy: {
        updated_at: "desc",
      },
      include: {
        trans_employees_overtimes: {
          ...emp_rev_include.employee_detail
        },
        trans_employees_overtimes_createdBy: {
          ...emp_rev_include.minor_detail
        },
      },
    });

    return NextResponse.json(overtimes);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
