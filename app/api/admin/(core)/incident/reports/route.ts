import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {

    const incident_reports = await prisma.dim_incident_reports.findMany({
        where: {
            deleted_at: null,
        },
        include: {
            trans_employees_dim_incident_reports_employee_idTotrans_employees: {
                ...emp_rev_include.employee_detail,
            },
            trans_employees_dim_incident_reports_reported_byTotrans_employees: {
                ...emp_rev_include.reviewer_detail,
            },
            
        }
    });

    return NextResponse.json(incident_reports);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch data: ${error}` },
      { status: 500 }
    );
  }
}
