import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { toGMT8 } from '@/lib/utils/toGMT8';

const prisma = new PrismaClient({
  log: ["error"],
});

// Define strict types for job data
interface JobData {
  name: string;
  department_id: number;
  is_active: boolean;
  superior_id: number | null;
  is_superior: boolean;
  max_employees: number | null;
  max_department_instances: number | null;
  min_salary: Prisma.Decimal;
  max_salary: Prisma.Decimal;
}

// Type guard for checking if a value is a valid number
function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

const baseJobSchema = z.object({
  name: z.string().min(1).max(45),
  department_id: z.number().min(1, "Department is required"),
  is_active: z.boolean().default(true),
  superior_id: z.number().nullable(),
  is_superior: z.boolean().default(false),
  max_employees: z.number().nullable(),
  max_department_instances: z.number().nullable(),
  min_salary: z.number().min(0, "Minimum salary cannot be negative"),
  max_salary: z.number().min(0, "Maximum salary cannot be negative"),
});

// Schema for creating new jobs
const createJobSchema = baseJobSchema.refine((data): data is z.infer<typeof baseJobSchema> => {
  if (!isValidNumber(data.min_salary) || !isValidNumber(data.max_salary)) {
    return false;
  }
  return data.min_salary < data.max_salary;
}, {
  message: "Minimum salary must be less than maximum salary",
  path: ["min_salary"],
});

// Schema for updating jobs
const updateJobSchema = baseJobSchema.partial().refine((data): data is Partial<z.infer<typeof baseJobSchema>> => {
  if (data.min_salary === undefined || data.max_salary === undefined) {
    return true;
  }
  if (!isValidNumber(data.min_salary) || !isValidNumber(data.max_salary)) {
    return false;
  }
  return data.min_salary < data.max_salary;
}, {
  message: "Minimum salary must be less than maximum salary",
  path: ["min_salary"],
});

async function checkDuplicateName(name: string, departmentId: number, excludeId?: number) {
  return await prisma.ref_job_classes.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      department_id: departmentId,
      deleted_at: null,
      id: excludeId ? { not: excludeId } : undefined,
    },
  });
}

async function getActiveEmployeeCount(jobId: number, departmentId?: number) {
  return await prisma.trans_employees.count({
    where: {
      job_id: jobId,
      deleted_at: null,
      AND: [
        { OR: [{ resignation_json: { equals: [] } }] },
        { OR: [{ termination_json: { equals: [] } }] }
      ],
      ...(departmentId && { department_id: departmentId })
    }
  });
}

async function validateSalaryRange(minSalary: number, maxSalary: number): Promise<boolean> {
  const existingSalaryGrades = await prisma.ref_salary_grades.findMany({
    where: {
      deleted_at: null,
      amount: {
        gte: new Prisma.Decimal(minSalary),
        lte: new Prisma.Decimal(maxSalary),
      },
    },
  });

  return existingSalaryGrades.length > 0;
}

async function getJobById(id: number) {
  const job = await prisma.ref_job_classes.findFirstOrThrow({
    where: {
      id,
      deleted_at: null,
    },
    include: {
      ref_departments: true,
      trans_employees: {
        where: {
          deleted_at: null,
          AND: [
            { OR: [{ resignation_json: { equals: [] } }] },
            { OR: [{ termination_json: { equals: [] } }] }
          ]
        }
      }
    },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  return job;
}

async function getAllJobs() {
  return await prisma.ref_job_classes.findMany({
    where: { deleted_at: null },
    include: {
      ref_departments: true,
      trans_employees: {
        where: {
          deleted_at: null,
          AND: [
            { OR: [{ resignation_json: { equals: [] } }] },
            { OR: [{ termination_json: { equals: [] } }] }
          ]
        }
      }
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const idParam = url.searchParams.get('id');

  try {
    if (idParam) {
      const id = parseInt(idParam);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid ID format' },
          { status: 400 }
        );
      }
      const result = await getJobById(id);
      return NextResponse.json(result);
    } else {
      const result = await getAllJobs();
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job positions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = createJobSchema.parse(data);
    
    const department = await prisma.ref_departments.findUnique({
      where: { id: validatedData.department_id }
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 400 }
      );
    }

    const existingJob = await checkDuplicateName(validatedData.name, validatedData.department_id);
    if (existingJob) {
      return NextResponse.json(
        { error: 'A job position with this name already exists in this department' },
        { status: 400 }
      );
    }

    const hasSalaryGrades = await validateSalaryRange(
      validatedData.min_salary,
      validatedData.max_salary
    );

    if (!hasSalaryGrades) {
      return NextResponse.json(
        { error: 'No salary grades found within the specified salary range' },
        { status: 400 }
      );
    }

    if (validatedData.is_superior) {
      const existingSuperior = await prisma.ref_job_classes.findFirst({
        where: {
          department_id: validatedData.department_id,
          is_superior: true,
          deleted_at: null,
        },
      });

      if (existingSuperior) {
        return NextResponse.json(
          { error: 'This department already has a superior position' },
          { status: 400 }
        );
      }
    }

    const job = await prisma.ref_job_classes.create({
      data: {
        ...validatedData,
        min_salary: new Prisma.Decimal(validatedData.min_salary),
        max_salary: new Prisma.Decimal(validatedData.max_salary),
        created_at: toGMT8().toISOString(),
        updated_at: toGMT8().toISOString(),
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error in POST:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create job position' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const idParam = url.searchParams.get('id');
  
  if (!idParam) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  try {
    const currentJob = await getJobById(id);
    const data = await req.json();
    const validatedData = updateJobSchema.parse(data);

    if (validatedData.department_id) {
      const department = await prisma.ref_departments.findUnique({
        where: { id: validatedData.department_id }
      });

      if (!department) {
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 400 }
        );
      }
    }

    if (validatedData.name && validatedData.department_id) {
      const existingJob = await checkDuplicateName(
        validatedData.name,
        validatedData.department_id,
        id
      );
      if (existingJob) {
        return NextResponse.json(
          { error: 'A job position with this name already exists in this department' },
          { status: 400 }
        );
      }
    }

    // Handle salary updates with proper typing
    const updateData: Prisma.ref_job_classesUpdateInput = {
      ...validatedData,
      updated_at: toGMT8().toISOString(),
    };

    if (validatedData.min_salary !== undefined) {
      updateData.min_salary = new Prisma.Decimal(validatedData.min_salary);
    }

    if (validatedData.max_salary !== undefined) {
      updateData.max_salary = new Prisma.Decimal(validatedData.max_salary);
    }

    // Validate salary range if either salary is updated
    if (validatedData.min_salary !== undefined || validatedData.max_salary !== undefined) {
      const minSalary = validatedData.min_salary ?? Number(currentJob.min_salary);
      const maxSalary = validatedData.max_salary ?? Number(currentJob.max_salary);

      const hasSalaryGrades = await validateSalaryRange(minSalary, maxSalary);
      if (!hasSalaryGrades) {
        return NextResponse.json(
          { error: 'No salary grades found within the specified salary range' },
          { status: 400 }
        );
      }
    }

    if (validatedData.is_superior) {
      const existingSuperior = await prisma.ref_job_classes.findFirst({
        where: {
          department_id: validatedData.department_id ?? currentJob.department_id,
          is_superior: true,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (existingSuperior) {
        return NextResponse.json(
          { error: 'This department already has a superior position' },
          { status: 400 }
        );
      }
    }

    if (validatedData.max_employees !== undefined && validatedData.max_employees !== null) {
      const currentActiveCount = await getActiveEmployeeCount(id);
      if (currentActiveCount > validatedData.max_employees) {
        return NextResponse.json(
          { error: 'Cannot set employee limit lower than current active employee count' },
          { status: 400 }
        );
      }
    }

    const job = await prisma.ref_job_classes.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error in PUT:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update job position' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const idParam = url.searchParams.get('id');

  if (!idParam) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  try {
    const activeCount = await getActiveEmployeeCount(id);
    if (activeCount > 0) {
      return NextResponse.json({
        error: 'Cannot delete job position that has active employees'
      }, { status: 400 });
    }

    const job = await prisma.ref_job_classes.update({
      where: { id },
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
    console.error('Error in DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to delete job position' },
      { status: 500 }
    );
  }
}