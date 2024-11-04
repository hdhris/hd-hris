import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

declare global {
  var prisma: PrismaClient | undefined;
}

// Singleton Prisma Client Initialization
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// Zod schema for employee validation
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
        days_json: z
          .union([z.string(), z.array(z.string())])
          .transform((val: string | string[]) => {
            if (typeof val === "string") {
              // Split by comma, trim whitespace, and filter out any empty strings
              return val
                .split(",")
                .map((day) => day.trim())
                .filter((day) => day.length > 0);
            }
            // If already an array, clean and filter it directly
            return val.filter((day) => day && day.trim().length > 0);
          })
          .refine((val) => val.length > 0, {
            message: "At least one working day is required",
          }),
      })
    )
    .optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(["active", "suspended", "resigned", "terminated"]),
  reason: z.string().optional(),
  date: z.string().optional(),
});

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
      error: `Failed to ${operation} employee`,
      message: (error as Error).message,
    },
    { status: 500 }
  );
}
// to show the data to terminal
// Log Operations for Debugging
// function logDatabaseOperation(operation: string, result: any) {
//   console.log(`Database operation: ${operation}`);
//   console.log("Result:", JSON.stringify(result, null, 2));
// }

// POST: Create a new employee
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // console.log("Incoming data:", data);
    //
    // Validate the incoming data against the schema
    const validatedData = employeeSchema.parse(data);
    // console.log("Validated data:", validatedData);

    // Handle creation of employee with related records
    const employee = await createEmployee(validatedData);

    // Return the created employee
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return handleError(error, "create");
  }
}

// Function to create an employee
async function createEmployee(data: z.infer<typeof employeeSchema>) {
  const { schedules, job_id, department_id, ...rest } = data;

  try {
    // 1. Create the employee record
    const employee = await prisma.trans_employees.create({
      data: {
        ...rest,
        hired_at: data.hired_at ? new Date(data.hired_at) : null,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        ref_departments: true,
        ref_job_classes: true,
        dim_schedules: { include: { ref_batch_schedules: true } },
      },
    });

    // 2. Connect job_class relation (if job_id exists)
    if (job_id) {
      await prisma.trans_employees.update({
        where: { id: employee.id },
        data: {
          ref_job_classes: { connect: { id: job_id } },
        },
      });
    }

    // 3. Connect department relation (if department_id exists)
    if (department_id) {
      await prisma.trans_employees.update({
        where: { id: employee.id },
        data: {
          ref_departments: { connect: { id: department_id } },
        },
      });
    }

    // 4. Handle creation of dim_schedules (if schedules exist)
    if (schedules) {
      await prisma.dim_schedules.createMany({
        data: schedules.map((schedule) => ({
          employee_id: employee.id, // Link schedules to the newly created employee
          batch_id: schedule.batch_id,
          days_json: schedule.days_json,
          created_at: new Date(),
          updated_at: new Date(),
        })),
      });
    }

    // logDatabaseOperation("CREATE employee", employee);
    return employee;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error; // Re-throw to be handled in the outer catch
  }
}

// GET: Fetch employees-leaves-status
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const daysJson = url.searchParams.get("days_json");

  let parsedDaysJson;
  if (daysJson) {
    try {
      parsedDaysJson = JSON.parse(daysJson);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid days_json format" },
        { status: 400 }
      );
    }
  }

  try {
    const result = id
      ? await getEmployeeById(parseInt(id), parsedDaysJson)
      : await getAllEmployees(parsedDaysJson);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "fetch");
  }
}

// Fetch employee by ID
async function getEmployeeById(id: number, daysJson?: Record<string, boolean>) {
  const employee = await prisma.trans_employees.findFirst({
    where: {
      id,
      deleted_at: null,
      dim_schedules: daysJson
        ? {
            some: {
              days_json: {
                equals: daysJson,
              },
            },
          }
        : undefined,
    },
    include: {
      ref_departments: true,
      ref_job_classes: true,
      dim_schedules: { include: { ref_batch_schedules: true } },
    },
  });

  // logDatabaseOperation("GET employee by ID", employee);
  if (!employee) throw new Error("Employee not found");
  return employee;
}

// Fetch all employees
async function getAllEmployees(daysJson?: Record<string, boolean>) {
  const employees = await prisma.trans_employees.findMany({
    where: {
      deleted_at: null,
      dim_schedules: daysJson
        ? {
            some: {
              days_json: {
                equals: daysJson,
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

  // logDatabaseOperation("GET all employees", employees);
  return employees;
}

// PUT: Update employee
export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const isStatusUpdate = url.searchParams.get("type") === "status";

  if (!id) {
    return NextResponse.json(
      { error: "Employee ID is required" },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();

    if (isStatusUpdate) {
      const validatedData = statusUpdateSchema.parse(data);
      const employee = await updateEmployeeStatus(parseInt(id), validatedData);
      return NextResponse.json(employee);
    } else {
      // Handle general update (existing code)
      const validatedData = employeeSchema.partial().parse(data);
      const employee = await updateEmployee(parseInt(id), validatedData);
      return NextResponse.json(employee);
    }
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

async function updateEmployee(
  id: number,
  data: Partial<z.infer<typeof employeeSchema>>
) {
  const { schedules, job_id, ...otherData } = data;

  const employee = await prisma.trans_employees.update({
    where: { id },
    data: {
      ...otherData,
      birthdate: otherData.birthdate
        ? new Date(otherData.birthdate)
        : undefined,
      updated_at: new Date(), // Ensure this line is present
    },
  });

  if (job_id) {
    await prisma.trans_employees.update({
      where: { id },
      data: { ref_job_classes: { connect: { id: job_id } } },
    });
  }

  if (schedules) {
    await prisma.dim_schedules.deleteMany({ where: { employee_id: id } });

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

  // logDatabaseOperation("UPDATE employee", employee);
  return employee;
}
async function updateEmployeeStatus(
  id: number,
  data: z.infer<typeof statusUpdateSchema>
) {
  const { status, reason, date } = data;
  const formattedDate = date
    ? new Date(date).toISOString().split("T")[0]
    : null;

  let updateData: any = {
    updated_at: new Date(),
    suspension_json: null,
    resignation_json: null,
    termination_json: null,
  };

  if (status !== "active") {
    const statusData =
      reason && formattedDate ? { reason, date: formattedDate } : null;

    switch (status) {
      case "suspended":
        updateData.suspension_json = statusData;
        break;
      case "resigned":
        updateData.resignation_json = statusData;
        break;
      case "terminated":
        updateData.termination_json = statusData;
        break;
      default:
        throw new Error(`Unexpected employee status: ${status}`);
    }
  }

  try {
    const employee = await prisma.trans_employees.update({
      where: { id },
      data: updateData,
    });

    return employee;
  } catch (error) {
    console.error("Error updating employee status:", error);
    throw new Error("Failed to update employee status: " + error);
  }
}

// DELETE: Soft delete an employee
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id)
    return NextResponse.json(
      { error: "Employee ID is required" },
      { status: 400 }
    );

  try {
    const employee = await prisma.trans_employees.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() },
    });
    // logDatabaseOperation("DELETE employee", employee);
    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    return handleError(error, "delete");
  }
}
