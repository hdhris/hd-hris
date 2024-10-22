import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

const departmentSchema = z.object({
  name: z.string().max(45),
  color: z.string().max(10).optional(),
  is_active: z.boolean().optional(),
});

function handleError(error: unknown, operation: string) {
  console.error(`Error during ${operation} operation:`, error);
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Invalid data", details: error.errors },
      { status: 400 }
    );
  }//
  return NextResponse.json(
    { error: `Failed to ${operation} department`, message: (error as Error).message },
    { status: 500 }
  );
}

// function logDatabaseOperation(operation: string, result: any) {
//   console.log(`Database operation: ${operation}`);
//   console.log("Result:", JSON.stringify(result, null, 2));
// }

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Incoming data:", data);

    const validatedData = departmentSchema.parse(data);
    console.log("Validated data:", validatedData);

    const department = await prisma.ref_departments.create({
      data: {
        ...validatedData,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // logDatabaseOperation("CREATE department", department);
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    return handleError(error, "create");
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    const result = id
      ? await getDepartmentById(parseInt(id))
      : await getAllDepartments();
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "fetch");
  }
}

async function getDepartmentById(id: number) {
  const department = await prisma.ref_departments.findFirst({
    where: { id, deleted_at: null },
    include: {
      _count: {
        select: { trans_employees: true }
      }
    }
  });

  if (!department) throw new Error("Department not found");
  
  const departmentWithCount = {
    ...department,
    employeeCount: department._count.trans_employees
  };

  // logDatabaseOperation("GET department by ID", departmentWithCount);
  return departmentWithCount;
}

async function getAllDepartments() {
  const departments = await prisma.ref_departments.findMany({
    where: { deleted_at: null },
    include: {
      _count: {
        select: { trans_employees: true }
      }
    }
  });

  const departmentsWithCount = departments.map(dept => ({
    ...dept,
    employeeCount: dept._count.trans_employees
  }));

  // logDatabaseOperation("GET all departments", departmentsWithCount);
  return departmentsWithCount;
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Department ID is required" }, { status: 400 });
  }

  try {
    const data = await req.json();

    const department = await prisma.ref_departments.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Department ID is required" }, { status: 400 });

  try {
    // Soft delete: Update the deleted_at field instead of removing the record
    const department = await prisma.ref_departments.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() },
    });

    // logDatabaseOperation("SOFT DELETE department", department);
    return NextResponse.json({ message: "Department soft deleted successfully" });
  } catch (error) {
    return handleError(error, "delete");
  }
}