import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    const payhead = await prisma.ref_payheads.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
    });
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
    return NextResponse.json({ payhead, affected, employees });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data:" + error },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, affected } = await req.json();
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  try {
    console.log(data);
    console.log(affected);

    await prisma.$transaction(async (pm) => {
      // Update the payhead record
      const payhead = await pm.ref_payheads.update({
        where: {
          id: id,
        },
        data: {
          name: data.name,
          calculation: data.calculation,
          is_mandatory: data.is_mandatory,
          is_active: data.is_active,
          created_at: toGMT8(new Date()),
          updated_at: toGMT8(new Date()),
        },
      });

      // Step 1: Fetch existing affected employees for this payhead
      const existingAffected = await pm.dim_payhead_affecteds.findMany({
        where: { payhead_id: id },
        select: { employee_id: true },
      });

      const existingEmployeeIds = existingAffected.map(
        (record) => record.employee_id
      );
      const newEmployeeIds = affected.map((employeeId: number) => employeeId);

      // Step 2: Find employees to delete and to create
      const employeesToDelete = existingEmployeeIds.filter(
        (employeeId) => !newEmployeeIds.includes(employeeId)
      ) as number[];

      const employeesToCreate = newEmployeeIds.filter(
        (employeeId: number) => !existingEmployeeIds.includes(employeeId)
      );

      // Step 3: Delete employees that are no longer affected
      if (employeesToDelete.length > 0) {
        await pm.dim_payhead_affecteds.deleteMany({
          where: {
            payhead_id: id,
            employee_id: {
              in: employeesToDelete,
            },
          },
        });
      }

      // Step 4: Create new affected employees
      if (employeesToCreate.length > 0) {
        await pm.dim_payhead_affecteds.createMany({
          data: employeesToCreate.map((employeeId: number) => ({
            payhead_id: id,
            employee_id: employeeId,
            created_at: toGMT8(new Date()),
            updated_at: toGMT8(new Date()),
          })),
        });
      }
    });
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    return NextResponse.json(
      { error: "Failed to fetch data: " + error },
      { status: 500 }
    );
  }
}
