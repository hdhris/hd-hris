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
    include: {
      ...getBaseEmployeeInclude(),
      acl_user_access_control: {
        select: {
          privilege_id: true,
          sys_privileges: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!employee) throw new Error("Employee not found");

  // Fetch user account information
  let userAccount = null;
  if (employee.email) {
    userAccount = await prisma.trans_users.findFirst({
      where: { email: employee.email },
      select: {
        id: true,
        email: true,
        auth_credentials: {
          select: {
            id: true,
            username: true,
            password: true,
          },
        },
      },
    });
  }

  const privilege = Array.isArray(employee.acl_user_access_control)
  ? employee.acl_user_access_control[0]?.sys_privileges
  : null;

const privilegeId = Array.isArray(employee.acl_user_access_control)
  ? employee.acl_user_access_control[0]?.privilege_id
  : null;

  
  const employeeWithAccount = {
    ...employee,
    userAccount,
    privilege,
    privilegeId,
  };

  return employeeWithAccount;
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