import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

const branchSchema = z.object({
  name: z.string().max(100),
  addr_municipal: z.number().nullable(),
  addr_province: z.number().nullable(),
  addr_region: z.number().nullable(),
  addr_baranggay: z.number().nullable(),
  is_active: z.boolean().optional(),
});

async function checkDuplicateName(name: string, excludeId?: number) {
  const existingBranch = await prisma.ref_branches.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
      deleted_at: null,
      id: excludeId ? { not: excludeId } : undefined,
    },
  });
  return existingBranch;
}

// Error Handling Helper
function handleError(error: unknown, operation: string) {
  console.error(`Error during ${operation} operation:`, error);
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Invalid data", details: error.errors },
      { status: 400 }
    );
  }
  return NextResponse.json(
    {
      error: `Failed to ${operation} branch`,
      message: (error as Error).message,
    },
    { status: 500 }
  );
}

// Log Operations for Debugging
// function logDatabaseOperation(operation: string, result: any) {
//   console.log(`Database operation: ${operation}`);
//   console.log("Result:", JSON.stringify(result, null, 2));
// }

// POST: Create a new branch
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // console.log("Incoming data:", data);
    const existingBranch = await checkDuplicateName(data.name);
    if (existingBranch) {
      return NextResponse.json(
        { error: "A branch with this name already exists" },
        { status: 400 }
      );
    }

    // Validate the incoming data against the schema
    const validatedData = branchSchema.parse(data);
     const existingSalgrade = await checkDuplicateName(validatedData.name);
     if (existingSalgrade) {
       return NextResponse.json(
         { error: "A salary grade with this name already exists" },
         { status: 400 }
       );
     }

    // Create the branch
    const branch = await prisma.ref_branches.create({
      data: {
        ...validatedData,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // logDatabaseOperation("CREATE branch", branch);
    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    return handleError(error, "create");
  }
}

// GET: Fetch branches
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    const result = id
      ? await getBranchById(parseInt(id))
      : await getAllBranches();
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "fetch");
  }
}

// Fetch branch by ID
async function getBranchById(id: number) {
  const branch = await prisma.ref_branches.findFirst({
    where: { id, deleted_at: null },
  });

  // logDatabaseOperation("GET branch by ID", branch);
  if (!branch) throw new Error("Branch not found");
  return branch;
}

// Fetch all branches
async function getAllBranches() {
  const branches = await prisma.ref_branches.findMany({
    where: { deleted_at: null },
  });

  // logDatabaseOperation("GET all branches", branches);
  return branches;
}

// PUT: Update branch
export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Branch ID is required" },
      { status: 400 }
    );
  }
  //
  try {
    const data = await req.json();
    const validatedData = branchSchema.parse(data);
    if (validatedData.name) {
      const existingBranch = await checkDuplicateName(
        validatedData.name,
        parseInt(id)
      );
      if (existingBranch) {
        return NextResponse.json(
          { error: "A Branch with this name already exists" },
          { status: 400 }
        );
      }
    }
    const branch = await prisma.ref_branches.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(branch);
  } catch (error) {
    return handleError(error, "update");
  }
}
//
// DELETE: Soft delete a branch
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id)
    return NextResponse.json(
      { error: "Branch ID is required" },
      { status: 400 }
    );

  try {
    const branch = await prisma.ref_branches.update({
      where: { id: parseInt(id), trans_employees: { none: {} } },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    if (!branch) {
      return NextResponse.json(
        { message: "Cannot delete branch with registered employees" },
        { status: 404 }
      );
    }

    // logDatabaseOperation("DELETE branch", branch);
    return NextResponse.json({ message: "Branch deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            status: "error",
            message: "Cannot delete branch that has registered employees",
          },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      {
        status: "error",
        message: "Cannot delete branch that has registered employees",
      },
      { status: 500 }
    );
  }
}
