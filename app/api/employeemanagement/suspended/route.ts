import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// GET: Fetch suspended employees
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    const result = id
      ? await getSuspendedEmployeeById(parseInt(id))
      : await getAllSuspendedEmployees();
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "fetch suspended employees");
  }
}

// Fetch suspended employee by ID
async function getSuspendedEmployeeById(id: number) {
  const employee = await prisma.trans_employees.findFirst({
    where: {
      id,
      suspension_json: { not: Prisma.JsonNull },
    },
    include: {
      ref_departments: true,
      ref_job_classes: true,
      dim_schedules: { include: { ref_batch_schedules: true } },
    },
  });

  if (!employee) throw new Error("Suspended employee not found");
  return employee;
}

// Fetch all suspended employees
async function getAllSuspendedEmployees() {
  const employees = await prisma.trans_employees.findMany({
    where: {
      suspension_json: { not: Prisma.JsonNull },
    },
    include: {
      ref_addresses_trans_employees_addr_baranggayToref_addresses: true,
      ref_addresses_trans_employees_addr_municipalToref_addresses: true,
      ref_addresses_trans_employees_addr_provinceToref_addresses: true,
      ref_addresses_trans_employees_addr_regionToref_addresses: true,
      ref_departments: true,
      ref_job_classes: true,
      dim_schedules: { include: { ref_batch_schedules: true } },
    },
  });

  return employees;
}

function handleError(error: unknown, operation: string) {
  console.error(`Error during ${operation} operation:`, error);
  return NextResponse.json(
    {
      error: `Failed to ${operation}`,
      message: (error as Error).message,
    },
    { status: 500 }
  );
}