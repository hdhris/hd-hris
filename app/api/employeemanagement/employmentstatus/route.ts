import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Updated employmentstatus schema for validation
const employmentstatusSchema = z.object({
  name: z.string().min(1).max(45),
});

// Error handling function
function handleError(error: unknown, operation: string) {
  console.error(`Error during ${operation} operation:`, error);
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 400 });
  }
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ error: `Failed to ${operation} employmentstatus` }, { status: 500 });
}

// GET - Fetch all employmentstatus classes or a single employmentstatus by ID
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id'); 
  try {
    let result;
    if (id) {
      result = await getEmploymentStatusById(parseInt(id));
    } else {
      result = await getAllEmploymentStatus();
    }
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, 'fetch');
  }
}

async function getEmploymentStatusById(id: number) {
  const employmentstatus = await prisma.ref_employment_status.findFirstOrThrow({
    where: {
      id,
      deleted_at: null,
    },
    include: {
      _count: {
        select: { trans_employees: true }
      }
    }
  });

  const empStatuswithCount = {
    ...employmentstatus,
    employeeCount: employmentstatus._count.trans_employees
  };
  
  return empStatuswithCount;
}

async function getAllEmploymentStatus() {
  const employmentStatus= await prisma.ref_employment_status.findMany({
    where: { deleted_at: null },
    include: {
      _count: {
        select: { trans_employees: true }
      }
    }
  });


const empStatuswithCount = employmentStatus.map(emp => ({
  ...emp,
  employeeCount: emp._count.trans_employees
}));

return empStatuswithCount;
}
// POST - Create a new employmentstatus class
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = employmentstatusSchema.parse(data);
    
    const employmentstatus = await prisma.ref_employment_status.create({
      data: {
        name: validatedData.name,
      },
    });

    return NextResponse.json(employmentstatus, { status: 201 });
  } catch (error) {
    return handleError(error, 'create');
  }
}

// PUT - Update an existing employmentstatus class
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'employmentstatus ID is required' }, { status: 400 });
  }

  try {
    const data = await req.json();
    const validatedData = employmentstatusSchema.partial().parse(data);
    
    const empstatus = await prisma.ref_employment_status.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(empstatus);
  } catch (error) {
    return handleError(error, 'update');
  }
}


// DELETE - Soft delete a employmentstatus class
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Employee Status ID is required' }, { status: 400 });
  }

  try {
    const employmentstatus = await prisma.ref_employment_status.update({
      where: { id: parseInt(id), trans_employees:{none:{}}},
      data: { 
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
    
    if (!employmentstatus){
    return NextResponse.json({message: 'Cannot delete employement status that has registered employees'},{status: 404});
    }
    return NextResponse.json({ message: 'Employee Status marked as deleted', employmentstatus });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          { 
            status: "error",
            message: "Cannot delete employement status that has registered employees" 
          }, 
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { 
        status: "error",
        message: "Cannot delete employement statusthat has registered employees" 
      }, 
      { status: 500 }
    );
  }
}