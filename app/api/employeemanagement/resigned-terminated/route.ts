import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// GET: Fetch resigned/terminated employees
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    const result = id
      ? await getResignedTerminatedEmployeeById(parseInt(id))
      : await getAllResignedTerminatedEmployees();
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "fetch resigned/terminated employees");
  }
}

// Fetch resigned/terminated employee by ID
async function getResignedTerminatedEmployeeById(id: number) {
  const employee = await prisma.trans_employees.findFirst({
    where: {
      id,
      deleted_at: { not: null },
      OR: [
        { resignation_json: { not: Prisma.JsonNull } },
        { termination_json: { not: Prisma.JsonNull } },
      ],
    },
    include: {
      ref_departments: true,
      ref_job_classes: true,
      dim_schedules: { include: { ref_batch_schedules: true } },
    },
  });

  if (!employee) throw new Error("Resigned/terminated employee not found");
  return employee;
}

// Fetch all resigned/terminated employees
async function getAllResignedTerminatedEmployees() {
  const employees = await prisma.trans_employees.findMany({
    where: {
      deleted_at: { not: null },
      OR: [
        { resignation_json: { not: Prisma.JsonNull } },
        { termination_json: { not: Prisma.JsonNull } },
      ],
    },
    include: {
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