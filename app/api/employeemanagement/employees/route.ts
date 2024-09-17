import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Employee schema for validation
const employeeSchema = z.object({
  branch_id: z.number().optional(),
  picture: z.string().optional(),
  first_name: z.string().max(45),
  last_name: z.string().max(45),
  middle_name: z.string().max(45).optional(),
  suffix: z.string().max(10).optional(),
  extension: z.string().max(10).optional(),
  email: z.string().email().max(45).optional(),
  contact_no: z.string().max(45).optional(),
  birthdate: z.string().optional(),
  hired_at: z.string().optional(),
  gender: z.string().max(10).optional(),
  job_id: z.number().optional(),
  department_id: z.number().optional(),
  addr_region: z.number().optional(),
  addr_province: z.number().optional(),
  addr_municipal: z.number().optional(),
  addr_baranggay: z.number().optional(),
  prefix: z.string().max(10).optional(),
  statutory_no_json: z.any().optional(),
  family_bg_json: z.any().optional(),
  educational_bg_json: z.any().optional(),
  civil_service_eligibility_json: z.any().optional(),
  work_experience_json: z.any().optional(),
  voluntary_organizations_json: z.any().optional(),
  training_programs_attended_json: z.any().optional(),
  government_issued_id_json: z.any().optional(),
  suspension_json: z.any().optional(),
  resignation_json: z.any().optional(),
  termination_json: z.any().optional(),
  schedules: z
    .array(
      z.object({
        batch_id: z.number(),
        days_json: z.record(z.boolean()),
      })
    )
    .optional(),
});

// Helper function to log database operations
function logDatabaseOperation(operation: string, result: any) {
  console.log(`Database operation: ${operation}`);
  console.log("Result:", JSON.stringify(result, null, 2));
}

// Error handling
function handleError(error: unknown, operation: string) {
  console.error(`Error during ${operation} operation:`, error);
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Invalid data", details: error.errors },
      { status: 400 }
    );
  }
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { error: `Failed to ${operation} employee` },
    { status: 500 }
  );
}

// GET - Fetch all employees or a single employee by ID
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const daysJson = url.searchParams.get("days_json"); // Get days_json from the query string

  let parsedDaysJson;
  if (daysJson) {
    try {
      parsedDaysJson = JSON.parse(daysJson); // Parse days_json back into an object
    } catch (error) {
      return NextResponse.json({ error: "Invalid days_json format" }, { status: 400 });
    }
  }

  try {
    let result;
    if (id) {
      result = await getEmployeeById(parseInt(id), parsedDaysJson);
    } else {
      result = await getAllEmployees(parsedDaysJson);
    }
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "fetch");
  }
}

// Fetch a single employee by ID, with optional days_json filter
async function getEmployeeById(id: number, daysJson?: Record<string, boolean>) {
  const employee = await prisma.trans_employees.findFirst({
    where: {
      id,
      deleted_at: null, // Exclude employees marked as deleted
      dim_schedules: daysJson
        ? {
            some: {
              days_json: {
                equals: daysJson, // Filter by days_json if provided
              },
            },
          }
        : undefined,
    },
    include: {
      ref_departments: true,
      ref_job_classes: true,
      ref_addresses_trans_employees_addr_regionToref_addresses: true,
      ref_addresses_trans_employees_addr_provinceToref_addresses: true,
      ref_addresses_trans_employees_addr_municipalToref_addresses: true,
      ref_addresses_trans_employees_addr_baranggayToref_addresses: true,
      dim_schedules: { include: { ref_batch_schedules: true } },
    },
  });

  logDatabaseOperation("GET employee by ID", employee);
  if (!employee) {
    throw new Error("Employee not found");
  }
  return employee;
}

// Fetch all employees, with optional days_json filter
async function getAllEmployees(daysJson?: Record<string, boolean>) {
  const employees = await prisma.trans_employees.findMany({
    where: {
      deleted_at: null, // Exclude employees marked as deleted
      dim_schedules: daysJson
        ? {
            some: {
              days_json: {
                equals: daysJson, // Filter by days_json if provided
              },
            },
          }
        : undefined,
    },
    include: {
      ref_departments: true,
      ref_job_classes: true,
      ref_addresses_trans_employees_addr_regionToref_addresses: true,
      ref_addresses_trans_employees_addr_provinceToref_addresses: true,
      ref_addresses_trans_employees_addr_municipalToref_addresses: true,
      ref_addresses_trans_employees_addr_baranggayToref_addresses: true,
      dim_schedules: { include: { ref_batch_schedules: true } },
    },
  });

  logDatabaseOperation("GET all employees", employees);
  return employees;
}
// POST - Create a new employee
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = employeeSchema.parse(data);
    const employee = await createEmployee({
      ...validatedData,
      picture: validatedData.picture, // This should now be the URL from EdgeStore
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return handleError(error, "create");
  }
}

async function createEmployee(data: z.infer<typeof employeeSchema>) {
  const {schedules} = data;
  const employee = await prisma.trans_employees.create({
    data: {
      ...data,
      hired_at: data.hired_at ? new Date(data.hired_at) : undefined,
      birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
      created_at: new Date(),
      updated_at: new Date(),
      dim_schedules: schedules
      
      ? {
          create: schedules.map((schedule) => ({
            batch_id: schedule.batch_id,
            days_json: schedule.days_json,
            created_at: new Date(),
            updated_at: new Date(),
          })),
        }
      : undefined,
    },
  });
  logDatabaseOperation("CREATE employee", employee);
  return employee;
}

// PUT - Update an existing employee
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Employee ID is required" },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();
    const validatedData = employeeSchema.partial().parse(data);
    const employee = await updateEmployee(parseInt(id), validatedData);
    return NextResponse.json(employee);
  } catch (error) {
    return handleError(error, "update");
  }
}

async function updateEmployee(
  id: number,
  data: Partial<z.infer<typeof employeeSchema>>
) {
  const { schedules, job_id, ...otherData } = data;

  // 1. Update non-relational fields first
  const employee = await prisma.trans_employees.update({
    where: { id },
    data: {
      ...otherData,
      birthdate: otherData.birthdate ? new Date(otherData.birthdate) : undefined,
      updated_at: new Date(),
    },
  });

  // 2. Update ref_job_classes relation separately (if job_id exists)
  if (job_id) {
    await prisma.trans_employees.update({
      where: { id },
      data: {
        ref_job_classes: { connect: { id: job_id } }, // Connect the job class
      },
    });
  }

  // 3. Update dim_schedules relation separately (if schedules exist)
  if (schedules) {
    await prisma.dim_schedules.deleteMany({
      where: { employee_id: id }, // Delete existing schedules
    });

    await prisma.dim_schedules.createMany({
      data: schedules.map((schedule) => ({
        employee_id: id,
        batch_id: schedule.batch_id,
        days_json: schedule.days_json,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    });
  }

  logDatabaseOperation("UPDATE employee", employee);
  return employee;
}

// DELETE - Mark an employee as deleted
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Employee ID is required" },
      { status: 400 }
    );
  }

  try {
    await softDeleteEmployee(parseInt(id));
    return NextResponse.json({ message: "Employee marked as deleted" });
  } catch (error) {
    return handleError(error, "delete");
  }
}

async function softDeleteEmployee(id: number) {
  const result = await prisma.trans_employees.update({
    where: { id },
    data: { deleted_at: new Date() }, // Set deleted_at to mark as deleted
  });
  logDatabaseOperation("SOFT DELETE employee", result);
}
