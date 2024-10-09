import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let idString = searchParams.get("id");
    const id = idString ? Number(idString) : null;
    const record = await prisma.trans_overtimes.findMany({
      where: {
        deleted_at: null,
        employee_id: id,
      },
      include: {
        trans_employees_overtimes: {
          select: {
            last_name: true,
            middle_name: true,
            first_name: true,
            prefix: true,
            suffix: true,
            extension: true,
            picture: true,
            email: true,
          },
        },
        trans_employees_overtimes_approvedBy : {
            select : {
              last_name: true,
              middle_name: true,
              first_name: true,
              picture: true,
              email: true,
            }
          }
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data:" + error },
      { status: 500 }
    );
  }
}
