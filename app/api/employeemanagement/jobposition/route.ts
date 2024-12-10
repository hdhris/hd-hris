import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Updated job schema for validation
const jobSchema = z.object({
  name: z.string().min(1).max(45),
  pay_rate: z
    .string()
    .regex(/^\d*\.?\d{0,2}$/, "Invalid decimal format")
    .transform((val) => new Prisma.Decimal(val)),
  is_active: z.boolean().default(true),
  superior_id: z.number().optional().nullable(),
  department_id: z.number().optional().nullable(),
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
  return NextResponse.json({ error: `Failed to ${operation} job` }, { status: 500 });
}

// GET - Fetch all job classes or a single job by ID
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  try {
    let result;
    if (id) {
      result = await getJobById(parseInt(id));
    } else {
      result = await getAllJobs();
    }
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, 'fetch');
  }
}

async function getJobById(id: number) {
  const job = await prisma.ref_job_classes.findFirstOrThrow({
    where: {
      id,
      deleted_at: null,
    },
    include: {
      ref_departments: true,
      trans_employees: true,
    },
  });
  
  return job;
}

async function getAllJobs() {
  return await prisma.ref_job_classes.findMany({
    where: { deleted_at: null },
    include: {
      ref_departments: true,
      trans_employees: true,
    },
  });
}

// POST - Create a new job class
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = jobSchema.parse(data);
    
    const job = await prisma.ref_job_classes.create({
      data: {
        name: validatedData.name,
        pay_rate: validatedData.pay_rate,
        is_active: validatedData.is_active,
        superior_id: validatedData.superior_id,
        department_id: validatedData.department_id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return handleError(error, 'create');
  }
}

// PUT - Update an existing job class
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  try {
    const data = await req.json();
    const validatedData = jobSchema.partial().parse(data);
    
    const job = await prisma.ref_job_classes.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    return handleError(error, 'update');
  }
}
//
// DELETE - Soft delete a job class
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  try {
    const job = await prisma.ref_job_classes.update({
      where: { id: parseInt(id),trans_employees: { none: {} } },
      data: { 
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
    
    if (!job){
      return NextResponse.json({message: 'Cannot delete job position that has registered employees'},{status: 404});
      }
      return NextResponse.json({ message: 'Job position marked as deleted', job });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return NextResponse.json(
            { 
              status: "error",
              message: "Cannot delete job position that has registered employees" 
            }, 
            { status: 400 }
          );
        }
      }
      return NextResponse.json(
        { 
          status: "error",
          message: "Cannot delete job position that has registered employees" 
        }, 
        { status: 500 }
      );
    }
  }