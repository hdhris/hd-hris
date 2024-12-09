// app/api/employeemanagement/employees/update.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { Prisma } from "@prisma/client";
import { employeeSchema, statusUpdateSchema, EmployeeInput, StatusUpdateInput } from "./types";
import { handleError } from "./utils";

export async function updateEmployee(
  id: number,
  data: Partial<EmployeeInput>
) {
  const {
    schedules,
    job_id,
    educational_bg_json,
    family_bg_json,
    ...otherData
  } = data;

  const employee = await prisma.trans_employees.update({
    where: { id },
    data: {
      ...otherData,
      birthdate: otherData.birthdate
        ? new Date(otherData.birthdate)
        : undefined,
      updated_at: new Date(),
      educational_bg_json: educational_bg_json
        ? ((typeof educational_bg_json === "string"
            ? JSON.parse(educational_bg_json)
            : educational_bg_json) as Prisma.InputJsonValue)
        : undefined,
      family_bg_json: family_bg_json
        ? ((typeof family_bg_json === "string"
            ? JSON.parse(family_bg_json)
            : family_bg_json) as Prisma.InputJsonValue)
        : undefined,
    },
  });

  if (job_id) {
    await prisma.trans_employees.update({
      where: { id },
      data: { ref_job_classes: { connect: { id: job_id } } },
    });
  }

  if (schedules) {
    await prisma.dim_schedules.deleteMany({ where: { employee_id: id } });

    await prisma.dim_schedules.createMany({
      data: schedules.map((schedule) => ({
        employee_id: id,
        batch_id: schedule.batch_id, 
        days_json: schedule.days_json,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    });
  }

  return employee;
}

export async function updateEmployeeStatus(
  id: number,
  data: StatusUpdateInput
) {
  const { status, reason, date, endDate } = data;

  let updateData: Prisma.trans_employeesUpdateInput = {
    updated_at: new Date(),
    deleted_at: ["resigned", "terminated"].includes(status) ? new Date() : null,
  };

  if (status === "active") {
    updateData.suspension_json = Prisma.JsonNull;
    updateData.resignation_json = Prisma.JsonNull;
    updateData.termination_json = Prisma.JsonNull;
  } else {
    switch (status) {
      case "suspended":
        updateData.suspension_json = {
          suspensionReason: reason,
          startDate: date,
          endDate: endDate,
        };
        break;
      case "resigned":
        updateData.resignation_json = {
          resignationReason: reason,
          resignationDate: date,
        };
        break;
      case "terminated":
        updateData.termination_json = {
          terminationReason: reason,
          terminationDate: date,
        };
        break;
    }
  }

  const employee = await prisma.trans_employees.update({
    where: { id },
    data: updateData,
  });

  return employee;
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const isStatusUpdate = url.searchParams.get("type") === "status";

  if (!id) {
    return NextResponse.json(
      { error: "Employee ID is required" },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();

    if (isStatusUpdate) {
      const validatedData = statusUpdateSchema.parse(data);
      const employee = await updateEmployeeStatus(parseInt(id), validatedData);
      return NextResponse.json(employee);
    } else {
      const validatedData = employeeSchema.partial().parse(data);
      const employee = await updateEmployee(parseInt(id), validatedData);
      return NextResponse.json(employee);
    }
  } catch (error) {
    return handleError(error, "update");
  }
}