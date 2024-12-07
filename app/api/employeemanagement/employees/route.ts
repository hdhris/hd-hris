import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
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
  suffix: z.string().max(10).optional().nullable(),
  extension: z.string().max(10).optional().nullable(),
  email: z.string().email().max(45).optional(),
  contact_no: z.string().max(45).optional(),
  birthdate: z.string().optional(),
  hired_at: z.string().optional(),
  gender: z.string().max(10).optional(),
  job_id: z.number().optional(),
  salary_grade_id: z.number().optional(),
  employement_status_id: z.number().optional(),
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
        // days_json: z
        //   .union([z.string(), z.array(z.string())])
        //   .transform((val: string | string[]) => {
        //     if (typeof val === "string") {
        //       // Split by comma, trim whitespace, and filter out any empty strings
        //       return val
        //         .split(",")
        //         .map((day) => day.trim())
        //         .filter((day) => day.length > 0);
        //     }
        //     // If already an array, clean and filter it directly
        //     return val.filter((day) => day && day.trim().length > 0);
        //   })
        //   .refine((val) => val.length > 0, {
        //     message: "At least one working day is required",
        //   }),
        days_json: z.array(z.string()),
      })
    )
    .optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(["active", "suspended", "resigned", "terminated"]),
  reason: z.string().optional(),
  date: z.string().optional(),
  endDate: z.string().optional(),
});

function parseJsonInput(data: any): Prisma.InputJsonValue {
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as Prisma.InputJsonValue;
    } catch {
      return {} as Prisma.InputJsonValue;
    }
  }
  return data as Prisma.InputJsonValue;
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
  const { schedules, job_id, department_id, educational_bg_json, family_bg_json, branch_id, employement_status_id, ...rest } = data;
  // console.log(data)
  const educationalBackground = parseJsonInput(educational_bg_json);
  const familyBackground = parseJsonInput(family_bg_json);

  try {
    // 1. Create the employee record
    const employee = await prisma.trans_employees.create({
      data: {
        ...rest,
        branch_id: data?.branch_id!,
        employement_status_id: data.employement_status_id!,
        hired_at: data.hired_at ? new Date(data.hired_at) : null,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        educational_bg_json: educationalBackground,
        family_bg_json: familyBackground,
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
//
// GET: Fetch employees-leaves-status

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const daysJson = url.searchParams.get("days_json");

  //just remove this if you want to display all data remove this pagination cause it was optional
  const page = Number(url.searchParams.get("page")) || 1;
  const rowsPerPage = Number(url.searchParams.get("rowsPerPage")) || 50000;//displaying total nnumber of data in a page you can define it here
  const pageSize = Math.min(rowsPerPage, 50000);

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
      : await getAllEmployees(parsedDaysJson, { page, pageSize });//remove the page and pagesize
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

//remove this
interface PaginationParams {
  page: number;
  pageSize: number;
}
//remove the pagination?:paginationparams
async function getAllEmployees(daysJson?: Record<string, boolean>, pagination?: PaginationParams) {
  const whereCondition = {
    AND: [
      { deleted_at: null },
      {
        OR: [
          { resignation_json: { equals: Prisma.JsonNull } },
          { resignation_json: { equals: Prisma.DbNull } },
        ],
      },
      {
        OR: [
          { termination_json: { equals: Prisma.JsonNull } },
          { termination_json: { equals: Prisma.DbNull } },
        ],
      },
      {
        OR: [
          { suspension_json: { equals: Prisma.JsonNull } },
          { suspension_json: { equals: Prisma.DbNull } },
        ],
      },
      daysJson
        ? {
            dim_schedules: {
              some: {
                days_json: {
                  equals: daysJson,
                },
              },
            },
          }
        : {},
    ],
  };

  //remove this pagination to display all data
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  // Get employees with pagination
  const employees = await prisma.trans_employees.findMany({
    where: whereCondition,
    orderBy: [
      {
        updated_at: 'desc'
      },
      {
        created_at: 'desc'
      }
    ],

    //remove this
    skip,
    take: pageSize,
    //
    include: {
      ref_departments: true,
      ref_job_classes: true,
      ref_employment_status: true,
      ref_addresses_trans_employees_addr_regionToref_addresses: true,
      ref_addresses_trans_employees_addr_provinceToref_addresses: true,
      ref_addresses_trans_employees_addr_municipalToref_addresses: true,
      ref_addresses_trans_employees_addr_baranggayToref_addresses: true,
      dim_schedules: { include: { ref_batch_schedules: true } },
    },
  });

  // Return just the employees array to match existing frontend expectations
  return employees;
}

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

  if (!employee) throw new Error("Employee not found");
  return employee;
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
  const {
    schedules,
    job_id,
    educational_bg_json,
    family_bg_json,
    ...otherData
  } = data;

  const employee = await prisma.trans_employees.update({
    where: { id },
    data: {
      ...otherData,
      birthdate: otherData.birthdate
        ? new Date(otherData.birthdate)
        : undefined,
      updated_at: new Date(), // Ensure this line is present
      educational_bg_json: educational_bg_json
        ? ((typeof educational_bg_json === "string"
            ? JSON.parse(educational_bg_json)
            : educational_bg_json) as Prisma.InputJsonValue)
        : undefined,
      family_bg_json: family_bg_json
        ? ((typeof family_bg_json === "string"
            ? JSON.parse(family_bg_json)
            : family_bg_json) as Prisma.InputJsonValue)
        : undefined,
    },
  });

  console.log(data);
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
  try {
    const { status, reason, date, endDate } = data;

    let updateData: Prisma.trans_employeesUpdateInput = {
      updated_at: new Date(),
      deleted_at: ["resined, terminated"].includes(status) ? new Date() : null,
    };

    if (status === "active") {
      updateData.suspension_json = Prisma.JsonNull;
      updateData.resignation_json = Prisma.JsonNull;
      updateData.termination_json = Prisma.JsonNull;
    } else {
      switch (status) {
        case "suspended":
          updateData.suspension_json = {
            suspensionReason: reason,
            startDate: date,
            endDate: endDate,
          };
          break;
        case "resigned":
          updateData.resignation_json = {
            resignationReason: reason,
            resignationDate: date,
          };
          break;
        case "terminated":
          updateData.termination_json = {
            terminationReason: reason,
            terminationDate: date,
          };
          break;
      }
    }

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
