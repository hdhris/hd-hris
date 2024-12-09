// app/api/employeemanagement/employees/read.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { Prisma } from "@prisma/client";
import { getBaseEmployeeInclude } from "./utils";

export async function getEmployeeById(id: number, daysJson?: Record<string, boolean>) {
  const employee = await prisma.trans_employees.findFirst({
    where: {
      id,
      deleted_at: null,
      dim_schedules: daysJson
        ? {
            some: {
              days_json: {
                equals: daysJson,
              },
            },
          }
        : undefined,
    },
    include: getBaseEmployeeInclude(),
  });

  if (!employee) throw new Error("Employee not found");
  return employee;
}

export async function getAllEmployees(daysJson?: Record<string, boolean>) {
  const whereCondition = {
    AND: [
      { deleted_at: null },
      {
        OR: [
          { resignation_json: { equals: Prisma.JsonNull } },
          { resignation_json: { equals: Prisma.DbNull } },
        ],
      },
      {
        OR: [
          { termination_json: { equals: Prisma.JsonNull } },
          { termination_json: { equals: Prisma.DbNull } },
        ],
      },
      {
        OR: [
          { suspension_json: { equals: Prisma.JsonNull } },
          { suspension_json: { equals: Prisma.DbNull } },
        ],
      },
      daysJson
        ? {
            dim_schedules: {
              some: {
                days_json: {
                  equals: daysJson,
                },
              },
            },
          }
        : {},
    ],
  };

  const employees = await prisma.trans_employees.findMany({
    where: whereCondition,
    orderBy: [
      { updated_at: 'desc' },
      { created_at: 'desc' }
    ],
    include: getBaseEmployeeInclude(),
  });

  return employees;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const daysJson = url.searchParams.get("days_json");

  let parsedDaysJson;
  if (daysJson) {
    try {
      parsedDaysJson = JSON.parse(daysJson);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid days_json format" },
        { status: 400 }
      );
    }
  }

  try {
    const result = id
      ? await getEmployeeById(parseInt(id), parsedDaysJson)
      : await getAllEmployees(parsedDaysJson);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}