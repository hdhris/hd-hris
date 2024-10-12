import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

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
        trans_employees : {
          deleted_at : null
        }
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
            id: true,
            name: true,
          },
        },
        ref_job_classes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const departments = await prisma.ref_departments.findMany({
      where : {
        deleted_at : null,
      },
      select : {
        id: true,
        name : true,
      }
    });

    const job_classes = await prisma.ref_job_classes.findMany({
      where: {
        deleted_at: null,
        ref_departments: {
          deleted_at: null,
        },
      },
      select: {
        id: true,
        name: true,
        department_id: true,
      },
    });
    

    if (payhead){
      return NextResponse.json({ payhead, affected, employees, departments, job_classes });
    } else {
      return NextResponse.json({ affected, employees, departments, job_classes });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data:" + error },
      { status: 500 }
    );
  }
}