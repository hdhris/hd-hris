import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { Prisma } from "@prisma/client";
import SimpleAES from "@/lib/cryptography/3des";
import { sendEmail } from "@/lib/utils/sendEmail";
import { employeeSchema, StatusUpdateInput, statusUpdateSchema } from "./types";
import { handleError } from "./utils";

interface Schedule {
  batch_id: number;
  days_json: string[];
}

export async function updateEmployee(id: number, employeeData: any) {
  return await prisma.$transaction(async (tx) => {
    // First verify the employee exists
    const existingEmployee = await tx.trans_employees.findUnique({
      where: { id },
      include: {
        dim_schedules: true,
        ref_branches: true,
        ref_departments: true,
        ref_job_classes: true,
      },
    });

    if (!existingEmployee) {
      throw new Error("Employee not found");
    }

    // Handle the main employee update
    const updatedEmployee = await tx.trans_employees.update({
      where: { id },
      data: {
        picture: employeeData.picture,
        first_name: employeeData.first_name,
        middle_name: employeeData.middle_name,
        last_name: employeeData.last_name,
        suffix: employeeData.suffix,
        extension: employeeData.extension,
        gender: employeeData.gender,
        email: employeeData.email,
        contact_no: employeeData.contact_no,
        birthdate: employeeData.birthdate ? new Date(employeeData.birthdate) : null,
        hired_at: employeeData.hired_at ? new Date(employeeData.hired_at) : null,
        updated_at: new Date(),
        educational_bg_json: employeeData.educational_bg_json,
        family_bg_json: employeeData.family_bg_json,

        // Reference connections
        ref_addresses_trans_employees_addr_regionToref_addresses: 
          employeeData.ref_addresses_trans_employees_addr_regionToref_addresses,
        ref_addresses_trans_employees_addr_provinceToref_addresses:
          employeeData.ref_addresses_trans_employees_addr_provinceToref_addresses,
        ref_addresses_trans_employees_addr_municipalToref_addresses:
          employeeData.ref_addresses_trans_employees_addr_municipalToref_addresses,
        ref_addresses_trans_employees_addr_baranggayToref_addresses:
          employeeData.ref_addresses_trans_employees_addr_baranggayToref_addresses,
        
        ref_branches: employeeData.ref_branches,
        ref_departments: employeeData.ref_departments,
        ref_job_classes: employeeData.ref_job_classes,
        ref_employment_status: employeeData.ref_employment_status,
        ref_salary_grades: employeeData.ref_salary_grades,
      },
      include: {
        dim_schedules: true,
        ref_branches: true,
        ref_departments: true,
        ref_job_classes: true,
        ref_employment_status: true,
        ref_salary_grades: true,
      },
    });

    // Handle schedule updates if provided
    if (Array.isArray(employeeData.schedules)) {
      // Delete existing schedules
      await tx.dim_schedules.deleteMany({
        where: { employee_id: id },
      });

      // Create new schedules if any are provided
      if (employeeData.schedules.length > 0) {
        await tx.dim_schedules.createMany({
          data: employeeData.schedules.map((schedule: Schedule) => ({
            employee_id: id,
            batch_id: schedule.batch_id,
            days_json: schedule.days_json,
            created_at: new Date(),
            updated_at: new Date(),
          })),
        });
      }
    }

    return updatedEmployee;
  });
}

export async function updateEmployeeAccount(id: number, data: { username: string; password: string }) {
  const employee = await prisma.trans_employees.findUnique({
    where: { id },
    select: { 
      email: true, 
      first_name: true,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const user = await prisma.trans_users.findFirst({
    where: { email: employee.email! },
  });

  if (!user) {
    throw new Error("User account not found");
  }

  // Get current credentials
  const currentCredentials = await prisma.auth_credentials.findFirst({
    where: { user_id: user.id },
  });

  // Only update what has changed
  const updateData: any = {};
  
  if (data.username && data.username !== currentCredentials?.username) {
    updateData.username = data.username;
  }
  
  if (data.password) {
    const encryptedPassword = await new SimpleAES().encryptData(data.password);
    if (encryptedPassword !== currentCredentials?.password) {
      updateData.password = encryptedPassword;
    }
  }

  // Only proceed with update if there are changes
  if (Object.keys(updateData).length > 0) {
    await prisma.auth_credentials.updateMany({
      where: { user_id: user.id },
      data: updateData,
    });

    // Only send email if password was actually changed
    if (updateData.password) {
      try {
        await sendEmail({
          to: employee.email!,
          subject: "Password Reset Notification",
          text: `Hello ${employee.first_name}!
            
            Your account password has been reset.
            Your new password is: ${data.password}
            
            Please change your password upon your next login for security purposes.
            
            Best regards,
            HR Team`,
        });
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }
    }
  }

  return { 
    success: true, 
    message: Object.keys(updateData).length > 0 
      ? "Account updated successfully" 
      : "No changes were necessary"
  };
}

export async function updateEmployeeStatus(id: number, data: StatusUpdateInput) {
  const { status, reason, date, endDate } = data;

  const updateData: Prisma.trans_employeesUpdateInput = {
    updated_at: new Date(),
    // deleted_at: ["resigned", "terminated"].includes(status) ? new Date() : null,
  };

  // Status-specific data updates
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
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const updateType = url.searchParams.get("type");

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    const data = await req.json();
    const employeeId = parseInt(id);

    switch (updateType) {
      case "account":
        const accountResult = await updateEmployeeAccount(employeeId, data);
        return NextResponse.json(accountResult);

      case "status":
        const validatedStatusData = statusUpdateSchema.parse(data);
        const statusResult = await updateEmployeeStatus(employeeId, validatedStatusData);
        return NextResponse.json(statusResult);

      default:
        const validatedData = employeeSchema.partial().parse(data);
        const updateResult = await updateEmployee(employeeId, validatedData);
        return NextResponse.json(updateResult);
    }
  } catch (error) {
    console.error("Update error:", error);
    return handleError(error, "update");
  }
}