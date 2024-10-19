import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getEmpFullName } from "@/lib/utils/nameFormatter";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const pr_dates = await prisma.trans_payroll_date.findMany({
        where: {
            deleted_at:null,
        },
        orderBy: {
          start_date: 'desc', // Sort by start_date in descending order
        },
      });
    const employees = await prisma.trans_employees.findMany({
        where : {
            deleted_at: null,
        },
        select: {
            id: true,
            last_name: true,
            first_name: true,
            middle_name: true,
            prefix: true,
            suffix: true,
            extension: true,
            picture: true,
            email: true,
            ref_branches : {
                select : {
                    id: true,
                    name: true,
                }
            },
            ref_job_classes : {
                select : {
                    id : true,
                    name : true,
                }
            },
            ref_departments : {
                select : {
                    id : true,
                    name : true,
                }
            }
        }
    })
    return NextResponse.json({pr_dates, employees});
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
