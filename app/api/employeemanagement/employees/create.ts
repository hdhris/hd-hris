// app/api/employeemanagement/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { Prisma } from "@prisma/client";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/lib/utils/sendEmail";
import { employeeSchema } from "./types";
import { parseJsonInput } from "./utils";

async function createEmployeeWithAccount(employeeData: any, accountData: any) {
  const { employee, credentials } = accountData;
  const { schedules, job_id, department_id, educational_bg_json, family_bg_json, ...rest } = employeeData;

  return await prisma.$transaction(async (tx) => {
    // Step 1: Check if username or email already exists
    const existingUser = await tx.trans_users.findFirst({
      where: {
        OR: [
          { email: employee.email },
          { auth_credentials: { username: credentials.username } }
        ]
      }
    });

    if (existingUser) {
      throw new Error("Username or email already exists");
    }

    // Step 2: Create user account and credentials
    const newUser = await tx.trans_users.create({
      data: {
        name: employee.first_name,
        email: employee.email,
        auth_credentials: {
          create: {
            username: credentials.username,
            password: await new SimpleAES().encryptData(credentials.password)
          }
        }
      }
    });

    // Step 3: Create employee record
    try {
      const educationalBackground = parseJsonInput(educational_bg_json);
      const familyBackground = parseJsonInput(family_bg_json);

      const newEmployee = await tx.trans_employees.create({
        data: {
          ...rest,
          branch_id: rest.branch_id!,
          employement_status_id: rest.employement_status_id!,
          hired_at: rest.hired_at ? new Date(rest.hired_at) : null,
          birthdate: rest.birthdate ? new Date(rest.birthdate) : null,
          educational_bg_json: educationalBackground,
          family_bg_json: familyBackground,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Step 4: Handle job and department connections
      if (job_id) {
        await tx.trans_employees.update({
          where: { id: newEmployee.id },
          data: { ref_job_classes: { connect: { id: job_id } } }
        });
      }

      if (department_id) {
        await tx.trans_employees.update({
          where: { id: newEmployee.id },
          data: { ref_departments: { connect: { id: department_id } } }
        });
      }

      // Step 5: Create schedules if provided
      if (schedules?.length) {
        await tx.dim_schedules.createMany({
          data: schedules.map((schedule: any) => ({
            employee_id: newEmployee.id,
            batch_id: schedule.batch_id,
            days_json: schedule.days_json,
            created_at: new Date(),
            updated_at: new Date()
          }))
        });
      }

      return { employee: newEmployee, userId: newUser.id };
    } catch (error) {
      // If employee creation fails, the transaction will roll back
      // including the user and credentials creation
      throw new Error("Failed to create employee record");
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.employee?.email || !data.credentials?.username || !data.credentials?.password) {
      return NextResponse.json({
        message: "Email, username and password are required"
      }, { status: 400 });
    }

    // Validate employee data
    const validatedData = employeeSchema.parse(data);
    
    // Create both employee and account in a single transaction
    const { employee, userId } = await createEmployeeWithAccount(validatedData, {
      employee: data.employee,
      credentials: data.credentials
    });

    // Send welcome email (non-blocking)
    try {
      await sendEmail({
        to: data.employee.email,
        subject: "Your Login Credentials",
        text: `
          Hello ${data.employee.first_name}!
          
          Your account has been created successfully.
          
          Your login credentials are:
          Username: ${data.credentials.username}
          Password: ${data.credentials.password}
          
          Please keep these credentials safe and change your password upon first login.
          
          Best regards,
          HR Team
        `
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({
          message: "Username or email already exists"
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      message: error instanceof Error ? error.message : "Failed to create employee and account",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}