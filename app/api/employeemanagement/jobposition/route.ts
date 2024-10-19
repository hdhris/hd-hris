import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Job schema for validation
const jobSchema = z.object({
  name: z.string().max(45).optional(),      // Job name is optional, max length 45 characters
  superior_id: z.number().optional(),       // Optional superior job class ID
  is_active: z.boolean().optional(),        // Optional active status, defaults to true in create
});

// Helper function to log database operations
function logDatabaseOperation(operation: string, result: any) {
  console.log(`Database operation: ${operation}`);
  console.log('Result:', JSON.stringify(result, null, 2));
}

// Error handling function
function handleError(error: unknown, operation: string) {
  console.error(`Error during ${operation} operation:`, error);
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
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

// Function to fetch a job by ID
async function getJobById(id: number) {
  const job = await prisma.ref_job_classes.findFirst({
    where: {
      id,
      deleted_at: null, // Only fetch jobs not marked as deleted
    },
    include: {
      ref_departments: true,  // Include related department
      trans_employees: true,  // Include related employees
    },
  });
  
  logDatabaseOperation('GET job by ID', job);

  if (!job) {
    throw new Error('Job not found');
  }

  return job;
}

// Function to fetch all jobs that are not soft deleted
async function getAllJobs() {
  const jobs = await prisma.ref_job_classes.findMany({
    where: { deleted_at: null }, // Exclude jobs marked as deleted
    include: {
      ref_departments: true,  // Include related departments
      trans_employees: true,  // Include related employees
    },
  });
  
  logDatabaseOperation('GET all jobs', jobs);
  
  return jobs;
}

// POST - Create a new job class
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = jobSchema.parse(data);
    const job = await createJob(validatedData);
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return handleError(error, 'create');
  }
}

// Function to create a new job class
async function createJob(data: z.infer<typeof jobSchema>) {
  const job = await prisma.ref_job_classes.create({
    data: {
      ...data,
      is_active: data.is_active !== undefined ? data.is_active : true, // Default to true if not provided
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  
  logDatabaseOperation('CREATE job', job);
  
  return job;
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
    const validatedData = jobSchema.partial().parse(data); // Partial update allowed
    const job = await updateJob(parseInt(id), validatedData);
    return NextResponse.json(job);
  } catch (error) {
    return handleError(error, 'update');
  }
}

// Function to update a job class by ID
async function updateJob(id: number, data: Partial<z.infer<typeof jobSchema>>) {
  const job = await prisma.ref_job_classes.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
  
  logDatabaseOperation('UPDATE job', job);
  
  return job;
}

// DELETE - Soft delete a job class by marking it with a deleted_at timestamp
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  try {
    await softDeleteJob(parseInt(id));
    return NextResponse.json({ message: 'Job marked as deleted' });
  } catch (error) {
    return handleError(error, 'delete');
  }
}

// Function to soft delete a job class
async function softDeleteJob(id: number) {
  const result = await prisma.ref_job_classes.update({
    where: { id },
    data: { deleted_at: new Date() }, // Set deleted_at to mark as deleted
  });
  
  logDatabaseOperation('SOFT DELETE job', result);
}
