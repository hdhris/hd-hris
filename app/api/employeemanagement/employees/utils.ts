// app/api/employeemanagement/employees/utils.ts

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function parseJsonInput(data: any): Prisma.InputJsonValue {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
}

export function handleError(error: unknown, operation: string) {
  console.error(`Error during ${operation} operation:`, error);
  
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid data", details: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Username or email already exists" },
        { status: 400 }
      );
    }
  }

  return NextResponse.json(
    {
      error: `Failed to ${operation} employee`,
      message: error instanceof Error ? error.message : "Unknown error",
    },
    { status: 500 }
  );
}

export const getBaseEmployeeInclude = () => ({
  ref_departments: true,
  ref_job_classes: true,
  ref_employment_status: true,
  ref_addresses_trans_employees_addr_regionToref_addresses: true,
  ref_addresses_trans_employees_addr_provinceToref_addresses: true,
  ref_addresses_trans_employees_addr_municipalToref_addresses: true,
  ref_addresses_trans_employees_addr_baranggayToref_addresses: true,
  dim_schedules: { 
    include: { 
      ref_batch_schedules: true 
    } 
  },
});