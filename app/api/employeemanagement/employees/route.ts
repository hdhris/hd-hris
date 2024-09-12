import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure this path is correct
import { Employee, Status } from '@/types/employeee/EmployeeType';
import { NextApiRequest, NextApiResponse } from 'next';

// Helper function to determine employee status
function determineEmployeeStatus(employee: any): Status {
  if (employee.termination_json) return 'terminated';
  if (employee.resignation_json) return 'resigned';
  if (employee.suspension_json) return 'suspended';
  return 'active';  // Default to 'active' if no status conditions are met
}

// Helper function to format employee data
function formatEmployee(employee: any): Employee {
  const currentYear = new Date().getFullYear();
  const birthdate = new Date(employee.birthdate);

  return {
    id: employee.id,
    branchId: employee.branch_id ?? 'Unknown',
    picture: employee.picture || '',
    firstName: employee.first_name,
    middleName: employee.middle_name || '',
    lastName: employee.last_name,
    age: currentYear - (birthdate.getFullYear() || 0),
    position: employee.ref_job_classes?.name || 'Unknown',
    department: employee.ref_departments?.name || 'Unknown',
    email: employee.email || 'Unknown',
    phone: employee.contact_no || 'Unknown',
    birthDate: employee.birthdate,
    gender: employee.gender || 'Unknown',
    status: determineEmployeeStatus(employee),
    suspension_json: employee.suspension_json || null,
    resignation_json: employee.resignation_json || null,
    termination_json: employee.termination_json || null,
    educational_bg_json: employee.educational_bg_json || null,
  };
}

// Fetch all employees
export async function GET() {
  try {
    const employees = await prisma.trans_employees.findMany({
      include: {
        ref_departments: true,  // Ensure the relation exists
        ref_job_classes: true,  // Ensure the relation exists
      },
    });

    const formattedEmployees = employees.map(formatEmployee);
    return NextResponse.json(formattedEmployees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

// Create a new employee
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {
        picture,
        firstName,
        middleName,
        lastName,
        gender,
        birthdate,
        addr_region,
        addr_province,
        addr_municipal,
        addr_baranggay,
        educationalBackground,
        hireDate,
        jobTitle,
        jobRole,
        workingType,
        contractYears,
        workSchedules,
      } = req.body;

      // Validate and sanitize inputs as needed
      if (!firstName || !lastName || !gender) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Create a new employee record in the database
      const newEmployee = await prisma.trans_employees.create({
        data: {
          picture,
          first_name: firstName,
          middle_name: middleName || null,
          last_name: lastName,
          gender,
          birthdate: birthdate ? new Date(birthdate) : null,
          addr_region: addr_region || null,
          addr_province: addr_province || null,
          addr_municipal: addr_municipal || null,
          addr_baranggay: addr_baranggay || null,
          educational_bg_json: educationalBackground || null,
          hired_at: hireDate ? new Date(hireDate) : null,
          // If jobTitle and jobRole need to be mapped to job_id and department_id, you should handle that here
          // For example, if jobTitle and jobRole are separate from job_id and department_id, you need to manage that mapping
          // Here I assume job_id and department_id should be handled separately or fetched based on title/role
          job_id: null, // You need to replace this with actual job_id if available
          department_id: null, // You need to replace this with actual department_id if available
          work_experience_json: workSchedules || null, // Assuming workSchedules is a JSON object
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      res.status(200).json(newEmployee);
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     // Ensure that IDs are parsed correctly
//     const jobClassId = parseInt(body.jobClassId, 10);
//     const departmentId = parseInt(body.departmentId, 10);

//     // Create a new employee record
//     const newEmployee = await prisma.trans_employees.create({
//       data: {
//         first_name: body.firstName,
//         middle_name: body.middleName || null,
//         last_name: body.lastName,
//         birthdate: new Date(body.birthdate),
//         branch_id: body.branchId || null,
//         picture: body.picture || '',
//         contact_no: body.phone || null,
//         email: body.email || null,
//         gender: body.gender || null,
//         job_id: jobClassId || null,
//         department_id: departmentId || null,
//         addr_region: body.addr_region || null,
//         addr_province: body.addr_province || null,
//         addr_municipal: body.addr_municipal || null,
//         addr_baranggay: body.addr_baranggay || null,
//         suspension_json: body.suspension_json ? JSON.parse(body.suspension_json) : null,
//         resignation_json: body.resignation_json ? JSON.parse(body.resignation_json) : null,
//         termination_json: body.termination_json ? JSON.parse(body.termination_json) : null,
//         educational_bg_json: body.educational_bg_json ? JSON.parse(body.educational_bg_json) : null,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     });

//     return NextResponse.json(newEmployee, { status: 201 });
//   } catch (error) {
//     console.error('Error creating employee:', error);
//     return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
//   }
// }

// Delete an employee
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await prisma.trans_employees.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
