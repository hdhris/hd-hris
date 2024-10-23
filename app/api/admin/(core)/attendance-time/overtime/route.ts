import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { getPaginatedData } from "@/server/pagination/paginate";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1"); // Default to page 1
    const perPage = parseInt(searchParams.get("limit") || "5"); // Default to 15 results per page
    const skip = (page - 1) * perPage;

    const overtimes = await prisma.trans_overtimes.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
      take: perPage,
      skip: skip,
      include: {
        trans_employees_overtimes: {
          select: {
            id: true,
            last_name: true,
            middle_name: true,
            first_name: true,
            prefix: true,
            suffix: true,
            extension: true,
            email: true,
            contact_no: true,
            picture: true,
            ref_departments: {
              select: {
                id: true,
                name: true,
              },
            },
            ref_branches: {
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
        },
        trans_employees_overtimes_approvedBy: {
          select: {
            last_name: true,
            middle_name: true,
            first_name: true,
            picture: true,
            email: true,
          },
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
