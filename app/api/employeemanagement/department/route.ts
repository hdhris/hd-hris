import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

declare global {
  var prisma: PrismaClient | undefined;
}

// Singleton Prisma Client Initialization
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// Zod schema for department validation
const departmentSchema = z.object({
  name: z.string().max(45),
  color: z.string().max(10).optional(),
  is_active: z.boolean().optional(),
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
    { error: `Failed to ${operation} department`, message: (error as Error).message },
    { status: 500 }
  );
}

// Log Operations for Debugging
function logDatabaseOperation(operation: string, result: any) {
  console.log(`Database operation: ${operation}`);
  console.log("Result:", JSON.stringify(result, null, 2));
}

// POST: Create a new department
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Incoming data:", data);

    // Validate the incoming data against the schema
    const validatedData = departmentSchema.parse(data);
    console.log("Validated data:", validatedData);

    // Create the department
    const department = await prisma.ref_departments.create({
      data: {
        ...validatedData,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    logDatabaseOperation("CREATE department", department);
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    return handleError(error, "create");
  }
}

// GET: Fetch departments
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    const result = id
      ? await getDepartmentById(parseInt(id))
      : await getAllDepartments();
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "fetch");
  }
}

// Fetch department by ID
async function getDepartmentById(id: number) {
  const department = await prisma.ref_departments.findFirst({
    where: { id, deleted_at: null },
  });

  logDatabaseOperation("GET department by ID", department);
  if (!department) throw new Error("Department not found");
  return department;
}

// Fetch all departments
async function getAllDepartments() {
  const departments = await prisma.ref_departments.findMany({
    where: { deleted_at: null },
  });

  logDatabaseOperation("GET all departments", departments);
  return departments;
}

// PUT: Update department
export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Department ID is required" }, { status: 400 });
  }

  try {
    const data = await req.json();

    // Assuming you have Prisma setup
    const department = await prisma.ref_departments.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
  }
}

// DELETE: Soft delete a department
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Department ID is required" }, { status: 400 });

  try {
    const department = await prisma.ref_departments.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() },
    });

    logDatabaseOperation("DELETE department", department);
    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error) {
    return handleError(error, "delete");
  }
}


// // department route.ts
// import { NextResponse } from "next/server";
// import {
//   DepartmentInfo,
//   EmployeeAssociate,
// } from "@/types/employeee/DepartmentType";
// import { Employee } from "@/types/employeee/EmployeeType";
// import { getRandomDateTime } from "@/lib/utils/dateFormatter";
// // Predefined list of departments
// const predefinedDepartments: DepartmentInfo[] = [
//   {
//     id: 1,
//     department: "Engineering",
//     department_status: "active",
//     heads: null,
//     assistants: [],
//     associated_employees: [],
//     total_employees: 0,
//     resignedEmployees: 0,
//   },
//   {
//     id: 2,
//     department: "Human Resources",
//     department_status: "active",
//     heads: null,
//     assistants: [],
//     associated_employees: [],
//     total_employees: 0,
//     resignedEmployees: 0,
//   },
//   {
//     id: 3,
//     department: "Marketing",
//     department_status: "active",
//     heads: null,
//     assistants: [],
//     associated_employees: [],
//     total_employees: 0,
//     resignedEmployees: 0,
//   },
//   {
//     id: 4,
//     department: "Finance",
//     department_status: "active",
//     heads: null,
//     assistants: [],
//     associated_employees: [],
//     total_employees: 0,
//     resignedEmployees: 0,
//   },
//   {
//     id: 5,
//     department: "Sales",
//     department_status: "active",
//     heads: null,
//     assistants: [],
//     associated_employees: [],
//     total_employees: 0,
//     resignedEmployees: 0,
//   },
// ];

// export async function GET() {
//     try {
//       // Fetch the employees data

//       //I HAVE NO OTHER OPTION TO MERGE THIS DATA TO ITS RESPECTIVE DEPARTMENTS!!!!
//       const employees: Employee[] = [
//         {
//             id: 1,
//             rfid: '123456',
//             picture: "https://randomuser.me/api/portraits/men/1.jpg",
//             name: "John Doe",
//             age: 30,
//             position: "Software Engineer",
//             department: "Engineering",
//             email: "john.doe@example.com",
//             phone: "123-456-7890",
//             gender: "male",
//             status: "active",
//             suspensionReason: null,
//             suspensionDate: null,
//             suspensionDuration: null,
//             retirementDate: null,
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: null,
//             resignationReason: null,
//         },
//         {
//             id: 2,
//             rfid: '654321',
//             picture: "https://randomuser.me/api/portraits/women/2.jpg",
//             name: "Jane Smith",
//             age: 45,
//             position: "Project Manager",
//             department: "Management",
//             email: "jane.smith@example.com",
//             phone: "098-765-4321",
//             gender: "female",
//             status: "active",
//             suspensionReason: null,
//             suspensionDate: null,
//             suspensionDuration: null,
//             retirementDate: getRandomDateTime(new Date("2022-01-01"), new Date("2023-01-01")),
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: null,
//             resignationReason: null,
//         },
        
//         {
//             id: 3,
//             rfid: '6543212321',
//             picture: "https://randomuser.me/api/portraits/men/3.jpg",
//             name: "Justin Beiber",
//             age: 45,
//             position: "Project Manager",
//             department: "Management",
//             email: "jane.smith@example.com",
//             phone: "098-765-4321",
//             gender: "male",
//             status: "active",
//             suspensionReason: null,
//             suspensionDate: null,
//             suspensionDuration: null,
//             retirementDate: getRandomDateTime(new Date("2022-01-01"), new Date("2023-01-01")),
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: null,
//             resignationReason: null,
//         },

//         {
//             id: 4,
//             rfid: '5678901234',
//             picture: "https://randomuser.me/api/portraits/women/7.jpg",
//             name: "Scarlett Johansson",
//             age: 36,
//             position: "HR Manager",
//             department: "Human Resources",
//             email: "scarlett.johansson@example.com",
//             phone: "234-567-8901",
//             gender: "female",
//             status: "retired",
//             suspensionReason: null,
//             suspensionDate: null,
//             suspensionDuration: null,
//             retirementDate: getRandomDateTime(new Date("2023-01-01"), new Date("2023-06-01")),
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: null,
//             resignationReason: "Tired of life",
//         },

//         {
//             id: 5,
//             rfid: '6543212321',
//             picture: "https://randomuser.me/api/portraits/men/9.jpg",
//             name: "Houston Rocker",
//             age: 45,
//             position: "Project Manager",
//             department: "Management",
//             email: "jane.smith@example.com",
//             phone: "098-765-4321",
//             gender: "female",
//             status: "active",
//             suspensionReason: null,
//             suspensionDate: null,
//             suspensionDuration: null,
//             retirementDate: getRandomDateTime(new Date("2022-01-01"), new Date("2023-01-01")),
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: null,
//             resignationReason: null,
//         },
//         {
//             id: 6,
//             rfid: '6543212321',
//             picture: "https://randomuser.me/api/portraits/men/4.jpg",
//             name: "Justin Timberlake",
//             age: 45,
//             position: "Project Manager",
//             department: "Management",
//             email: "justin.timberlake@example.com",
//             phone: "098-765-4321",
//             gender: "male",
//             status: "resigned",
//             suspensionReason: null,
//             suspensionDate: null,
//             suspensionDuration: null,
//             retirementDate: null,
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: getRandomDateTime(new Date("2023-02-01"), new Date("2023-06-01")),
//             resignationReason: "Pursuing personal projects and career change",
//         },
//         {
//             id: 7,
//             rfid: '1234567890',
//             picture: "https://randomuser.me/api/portraits/women/5.jpg",
//             name: "Mariah Carey",
//             age: 40,
//             position: "Marketing Specialist",
//             department: "Marketing",
//             email: "mariah.carey@example.com",
//             phone: "123-456-7890",
//             gender: "female",
//             status: "resigned",
//             suspensionReason: null,
//             suspensionDate: null,
//             suspensionDuration: null,
//             retirementDate: null,
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: getRandomDateTime(new Date("2022-07-01"), new Date("2022-09-01")),
//             resignationReason: "Relocating to another city",
//         },
//         {
//             id: 8,
//             rfid: '0987654321',
//             picture: "https://randomuser.me/api/portraits/men/6.jpg",
//             name: "Chris Hemsworth",
//             age: 38,
//             position: "Software Engineer",
//             department: "IT",
//             email: "chris.hemsworth@example.com",
//             phone: "098-123-4567",
//             gender: "male",
//             status: "resigned",
//             suspensionReason: null,
//             suspensionDate: null,
//             suspensionDuration: null,
//             retirementDate: null,
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: getRandomDateTime(new Date("2023-03-01"), new Date("2023-05-01")),
//             resignationReason: "Pursuing further education",
//         },
        
//         {
//             id: 9,
//             rfid: '6789012345',
//             picture: "https://randomuser.me/api/portraits/men/8.jpg",
//             name: "Tom Hiddleston",
//             age: 42,
//             position: "Finance Manager",
//             department: "Finance",
//             email: "tom.hiddleston@example.com",
//             phone: "345-678-9012",
//             gender: "male",
//             status: "terminated",
//             suspensionReason: "Policy violation",
//             suspensionDate: getRandomDateTime(new Date("2023-04-01"), new Date("2023-06-01")),
//             suspensionDuration: 8,
//             retirementDate: null,
//             terminationReason: "Fraudulent activities",
//             terminationDate: getRandomDateTime(new Date("2023-07-01"), new Date("2023-08-01")),
//             resignationDate: null,
//             resignationReason: null,
//         },
//         {
//             id: 10,
//             rfid: '123456',
//             picture: "https://randomuser.me/api/portraits/women/3.jpg",
//             name: "Bebeh Koh",
//             age: 25,
//             position: "Software Engineer",
//             department: "Engineering",
//             email: "john.doe@example.com",
//             phone: "123-456-7890",
//             gender: "female",
//             status: "suspended",
//             suspensionReason: "Overacting",
//             suspensionDate: getRandomDateTime(new Date("2022-01-01"), new Date("2023-01-01")),
//             suspensionDuration: 8,
//             retirementDate: null,
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: null,
//             resignationReason: null,
//         },
//         {
//             id: 11,
//             rfid: '654321',
//             picture: "https://randomuser.me/api/portraits/women/11.jpg",
//             name: "Melody Losia",
//             age: 23,
//             position: "Project Manager",
//             department: "Management",
//             email: "jane.smith@example.com",
//             phone: "098-765-4321",
//             gender: "female",
//             status: "suspended",
//             suspensionReason: "Malande",
//             suspensionDate: getRandomDateTime(new Date("2022-01-01"), new Date("2023-01-01")),
//             suspensionDuration: 10,
//             retirementDate: null,
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: null,
//             resignationReason: null,
//         },
//         {
//             id: 12,
//             rfid: '6543212321',
//             picture: "https://randomuser.me/api/portraits/men/10.jpg",
//             name: "Happy Sad",
//             age: 45,
//             position: "Project Manager",
//             department: "Management",
//             email: "jane.smith@example.com",
//             phone: "098-765-4321",
//             gender: "male",
//             status: "suspended",
//             suspensionReason: "Playing ML",
//             suspensionDate: getRandomDateTime(new Date("2022-01-01"), new Date("2023-01-01")),
//             suspensionDuration: 8,
//             retirementDate: null,
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: null,
//             resignationReason: null,
//         },

//         {
//             id: 13,
//             rfid: '6543212321',
//             picture: "https://randomuser.me/api/portraits/men/21.jpg",
//             name: "Justin Han",
//             age: 45,
//             position: "Project Manager",
//             department: "Management",
//             email: "jane.smith@example.com",
//             phone: "098-765-4321",
//             gender: "male",
//             status: "suspended",
//             suspensionReason: "Lazy",
//             suspensionDate: getRandomDateTime(new Date("2022-01-01"), new Date("2023-01-01")),
//             suspensionDuration: 10,
//             retirementDate: null,
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: null,
//             resignationReason: null,
//         },
//         {
//             id: 14,
//             rfid: '6543212321',
//             picture: "https://randomuser.me/api/portraits/men/31.jpg",
//             name: "Rocky boy",
//             age: 45,
//             position: "Project Manager",
//             department: "Management",
//             email: "jane.smith@example.com",
//             phone: "098-765-4321",
//             gender: "male",
//             status: "active",
//             suspensionReason: "ugly",
//             suspensionDate: getRandomDateTime(new Date("2022-01-01"), new Date("2023-01-01")),
//             suspensionDuration: 10,
//             retirementDate: null,
//             terminationReason: null,
//             terminationDate: null,
//             resignationDate: null,
//             resignationReason: null,
//         },
//       ];
  
//       // Map to keep track of departments
//       const departmentsMap = new Map<string, DepartmentInfo>();
  
//       // Initialize the departmentsMap with predefined departments
//       predefinedDepartments.forEach((department) => {
//         departmentsMap.set(department.department, { ...department });
//       });
  
//       // Track the number of resigned employees per department
//       const resignedEmployeesCount: { [department: string]: number } = {};
  
//       // Group employees by department
//       employees.forEach((employee) => {
//         const { department, id, name, position, picture, status } = employee;
  
//         if (!departmentsMap.has(department)) {
//           console.warn(`Department ${department} not found in predefined list.`);
//           return; // Or you can choose to add the department dynamically
//         }
  
//         const dept = departmentsMap.get(department)!;
  
//         const employeeAssociate: EmployeeAssociate = {
//           employee_id: id,
//           fullName: name,
//           job_title: position,
//           picture: picture,
//         };
  
//         // Assign department head, assistants, or associated employees
//         if (position.includes("Manager")) {
//           if (dept.heads === null) {
//             dept.heads = {
//               job: position,
//               fullName: name,
//               picture: picture,
//             };
//           } else {
//             dept.assistants?.push({
//               job: position,
//               fullName: name,
//               picture: picture,
//             });
//           }
//         } else {
//           dept.associated_employees.push(employeeAssociate);
//         }
  
//         // Increment the total employees for the department
//         dept.total_employees += 1;
  
//         // Track resigned employees
//         if (status === "resigned") {
//           if (!resignedEmployeesCount[department]) {
//             resignedEmployeesCount[department] = 0;
//           }
//           resignedEmployeesCount[department] += 1;
//         }
//       });
  
//       // Add the resigned employees count to each department
//       departmentsMap.forEach((dept) => {
//         dept.resignedEmployees = resignedEmployeesCount[dept.department] || 0;
//       });
  
//       // Convert the departmentsMap to an array for response
//       const departmentData = Array.from(departmentsMap.values());
  
//       return NextResponse.json(departmentData, { status: 200 });
//     } catch (error) {
//       console.error('Failed to fetch departments:', error);
//       return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
//     }
//   }