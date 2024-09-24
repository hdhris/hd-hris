import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let idString = searchParams.get("id");
    const id = idString? Number(idString) : null
    const payhead = id? await prisma.ref_payheads.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
    }) : null;
    const affected = await prisma.dim_payhead_affecteds.findMany({
      where: {
        payhead_id: id,
      },
    });
    const employees = await prisma.trans_employees.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        picture: true,
        last_name: true,
        first_name: true,
        middle_name: true,
        ref_departments: {
          select: {
            name: true,
          },
        },
        ref_job_classes: {
          select: {
            name: true,
          },
        },
      },
    });

    if (payhead){
      return NextResponse.json({ payhead, affected, employees });
    } else {
      return NextResponse.json({ affected, employees });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data:" + error },
      { status: 500 }
    );
  }
}