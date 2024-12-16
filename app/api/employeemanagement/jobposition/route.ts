import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Updated job schema for validation
const jobSchema = z.object({
  name: z.string().min(1).max(45),
  is_active: z.boolean().default(true),
  superior_id: z.number().optional().nullable(),
  is_superior: z.boolean().default(false),
  max_employees: z.number().optional().nullable(),
  max_department_instances: z.number().optional().nullable(),
});
//check if name exist
async function checkDuplicateName(name: string, excludeId?: number) {
  const existingJob = await prisma.ref_job_classes.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      deleted_at: null,
      id: excludeId ? { not: excludeId } : undefined,
    },
  });
  return existingJob;
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
  
      trans_employees: true,
    },
  });
  
  return job;
}

async function getAllJobs() {
  return await prisma.ref_job_classes.findMany({
    where: { deleted_at: null },
    include: {
   
      trans_employees: true,
    },
  });
}

// POST - Create a new job class
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = jobSchema.parse(data);
    
    //call
    const existingJob = await checkDuplicateName(validatedData.name);
if (existingJob) {
  return NextResponse.json(
    { error: 'A job position with this name already exists' },
    { status: 400 }
  );
}
    const job = await prisma.ref_job_classes.create({
      data: {
        name: validatedData.name,
        // pay_rate: validatedData.pay_rate,
        is_active: validatedData.is_active,
        superior_id: validatedData.superior_id,
        max_employees: validatedData.max_employees,
        max_department_instances: validatedData.max_department_instances,
        is_superior: validatedData.is_superior,
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
    //call
    if (validatedData.name) {
      const existingJob = await checkDuplicateName(validatedData.name, parseInt(id));
      if (existingJob) {
        return NextResponse.json(
          { error: 'A job position with this name already exists' },
          { status: 400 }
        );
      }
    }
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

  try {
    if (!id) {
      // return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
      throw new Error('Job ID is required');
    }
    const jobclass = await prisma.ref_job_classes.findFirst({
      where: { id: parseInt(id), trans_employees:{none:{}}}
    });
    
    if (!jobclass){
      return NextResponse.json({
        success: false,
        message: 'Cannot delete job that has registered employees'
      }, {status: 400})
    }

    await prisma.ref_job_classes.update({
      where: { id: jobclass.id},
      data: { 
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ message: 'Job marked as deleted', jobclass });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error },{ status: 400 });
  }
}