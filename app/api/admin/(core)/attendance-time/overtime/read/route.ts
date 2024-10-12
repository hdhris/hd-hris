import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

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
      select: {
        id: true,
        picture: true,
        last_name: true,
        first_name: true,
        middle_name: true,
        email: true,
        ref_departments: {
          select: {
            id: true,
            name: true,
          },
        },
        ref_job_classes: {
          select: {
            id: true,
            name: true,
            pay_rate: true,
          },
        },
      },
    });
    
    return NextResponse.json({overtime,employees});
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data:" + error },
      { status: 500 }
    );
  }
}