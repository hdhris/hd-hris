import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { toGMT8 } from '@/lib/utils/toGMT8';

const prisma = new PrismaClient({
  log: ["error"],
});

const jobSchema = z.object({
  name: z.string().min(1).max(45),
  is_active: z.boolean().default(true),
  superior_id: z.number().optional().nullable(),
  is_superior: z.boolean().default(false),
  max_employees: z.number().optional().nullable(),
  max_department_instances: z.number().optional().nullable(),
});

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

async function getActiveEmployeeCount(jobId: number, departmentId?: number) {
  return await prisma.trans_employees.count({
    where: {
      job_id: jobId,
      deleted_at: null,
      AND: [
        {
          OR: [
            
            { resignation_json: { equals: [] } }
          ]
        },
        {
          OR: [
           
            { termination_json: { equals: [] } }
          ]
        }
      ],
      ...(departmentId && { department_id: departmentId })
    }
  });
}

async function getJobById(id: number) {
  return await prisma.ref_job_classes.findFirstOrThrow({
    where: {
      id,
      deleted_at: null,
    },
    include: {
      trans_employees: {
        where: {
          deleted_at: null,
          AND: [
            {
              OR: [
             
                { resignation_json: { equals: [] } }
              ]
            },
            {
              OR: [
               
                { termination_json: { equals: [] } }
              ]
            }
          ]
        }
      }
    },
  });
}

async function getAllJobs() {
  return await prisma.ref_job_classes.findMany({
    where: { deleted_at: null },
    include: {
      trans_employees: {
        where: {
          deleted_at: null,
          AND: [
            {
              OR: [
               
                { resignation_json: { equals: [] } }
              ]
            },
            {
              OR: [
                
                { termination_json: { equals: [] } }
              ]
            }
          ]
        }
      }
    },
  });
}

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

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = jobSchema.parse(data);
    
    const existingJob = await checkDuplicateName(validatedData.name);
    if (existingJob) {
      return NextResponse.json(
        { error: 'A job position with this name already exists' },
        { status: 400 }
      );
    }

    const job = await prisma.ref_job_classes.create({
      data: {
        ...validatedData,
        created_at: toGMT8().toISOString(),
        updated_at: toGMT8().toISOString(),
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return handleError(error, 'create');
  }
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  try {
    const data = await req.json();
    const validatedData = jobSchema.partial().parse(data);

    if (validatedData.name) {
      const existingJob = await checkDuplicateName(validatedData.name, parseInt(id));
      if (existingJob) {
        return NextResponse.json(
          { error: 'A job position with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Check employee limits if updating max_employees
    if (validatedData.max_employees !== undefined) {
      const currentActiveCount = await getActiveEmployeeCount(parseInt(id));
      if (validatedData.max_employees !== null && currentActiveCount > validatedData.max_employees) {
        return NextResponse.json(
          { error: 'Cannot set employee limit lower than current active employee count' },
          { status: 400 }
        );
      }
    }

    const job = await prisma.ref_job_classes.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        updated_at: toGMT8().toISOString(),
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    return handleError(error, 'update');
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  try {
    if (!id) {
      throw new Error('Job ID is required');
    }

    // Check for active employees before deletion
    const activeCount = await getActiveEmployeeCount(parseInt(id));
    if (activeCount > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete job position that has active employees'
      }, { status: 400 });
    }

    const job = await prisma.ref_job_classes.update({
      where: { id: parseInt(id) },
      data: { 
        deleted_at: toGMT8().toISOString(),
        updated_at: toGMT8().toISOString(),
      },
    });

    return NextResponse.json({ 
      message: 'Job position deleted successfully',
      job 
    });
  } catch (error) {
    return handleError(error, 'delete');
  }
}