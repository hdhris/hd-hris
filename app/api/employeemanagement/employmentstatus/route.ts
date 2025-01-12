import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Updated employmentstatus schema for validation
const employmentstatusSchema = z.object({
  name: z.string().min(1).max(45),
  // appraisal_interval: z.number().int().min(1),
  // superior_id: z.number().optional().nullable(),
});

async function checkDuplicateName(name: string, excludeId?: number) {
  const existingEmpstatus = await prisma.ref_employment_status.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      deleted_at: null,
      id: excludeId ? { not: excludeId } : undefined,
    },
  });
  return existingEmpstatus;
}

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
      const existingEmpstatus = await checkDuplicateName(validatedData.name);
        if (existingEmpstatus) {
          return NextResponse.json(
            { error: "An employment status with this name already exists" },
            { status: 400 }
          );
        }
    const employmentstatus = await prisma.ref_employment_status.create({
      data: {
        name: validatedData.name,
        // appraisal_interval: validatedData.appraisal_interval,
        // superior_id: validatedData.superior_id,
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
     if (data.name) {
          const existingEmpstatus = await checkDuplicateName(data.name, parseInt(id));
          if (existingEmpstatus) {
            return NextResponse.json(
              { error: "An existing employment status with this name already exists" },
              { status: 400 }
            );
          }
        }
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

  try {
    if (!id) {
      // return NextResponse.json({ error: 'Employee Status ID is required' }, { status: 400 });
      throw new Error('Employee Status ID is required');
    }
    const employmentstatus = await prisma.ref_employment_status.findFirst({
      where: { id: parseInt(id), trans_employees:{none:{}}}
    });

    if (!employmentstatus){
      return NextResponse.json({
        success: false,
        message: 'Cannot delete employement status that has registered employees'
      }, {status: 400})
    }

    await prisma.ref_employment_status.update({
      where: { id: employmentstatus.id},
      data: { 
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ message: 'Employee Status marked as deleted', employmentstatus });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error },{ status: 400 });
  }
}