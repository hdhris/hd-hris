import { PrismaClient, Prisma } from "@prisma/client";
import { StatusUpdateInput } from "./types";
import { getSignatory } from "@/server/signatory";
import { auth } from "@/auth";
import { UnavaliableStatusJSON } from "@/types/employeee/EmployeeType";
import { toGMT8 } from "@/lib/utils/toGMT8";

const prisma = new PrismaClient({
  log: ["error"],
});

export async function updateEmployeeStatus(id: number, data: { updateData: UnavaliableStatusJSON, status: "active" | "terminated" | "resigned" | "suspended" }) {
  try {
    const session = await auth();

    // const { status, reason, date, endDate } = data;
    const { updateData, status } = data;
    // const updateData: Prisma.trans_employeesUpdateInput = {
    //   updated_at: new Date(),
    // };

    // const signatoryPath = 
    //   status === 'suspended' ? 'employee_suspension' :
    //   status === 'resigned' ? 'employee_resignation' :
    //   status === 'terminated' ? 'employee_termination' : null;

    // const signatories = signatoryPath 
    //   ? await getSignatory(signatoryPath, id, false) 
    //   : null;

    // const transformedSignatories = signatories ? {
    //   users: signatories.users.map(user => ({
    //     id: user.id,
    //     name: user.name,
    //     email: user.email,
    //     picture: user.picture,
    //     role: user.role
    //   }))
    // } : null;

    // if (status === "active") {
    //   // updateData.suspension_json = Prisma.JsonNull;
    //   // updateData.resignation_json = Prisma.JsonNull;
    //   // updateData.termination_json = Prisma.JsonNull;
    // } else {
    //   switch (status) {
    //     case "suspended":
    //       updateData.suspension_json = {
    //         suspensionReason: reason,
    //         startDate: date,
    //         endDate: endDate,
    //         signatories: transformedSignatories,
    //         initiatedBy: session?.user ? {
    //           id: session.user.id,
    //           name: session.user.name,
    //           picture: session.user.image
    //         } : null
    //       };
    //       break;
    //     case "resigned":
    //       updateData.resignation_json = {
    //         resignationReason: reason,
    //         resignationDate: date,
    //         signatories: transformedSignatories,
    //         initiatedBy: session?.user ? {
    //           id: session.user.id,
    //           name: session.user.name,
    //           picture: session.user.image
    //         } : null
    //       };
    //       break;
    //     case "terminated":
    //       updateData.termination_json = {
    //         terminationReason: reason,
    //         terminationDate: date,
    //         signatories: transformedSignatories,
    //         initiatedBy: session?.user ? {
    //           id: session.user.id,
    //           name: session.user.name,
    //           picture: session.user.image
    //         } : null
    //       };
    //       break;
    //   }
    // }

    const newJSON = () =>{
      if(status === "suspended"){
        return {
          suspension_json: updateData as any,
        }
      } else if(status === "resigned"){
        return {
          resignation_json: updateData as any,
        }
      } else if(status === "terminated"){
        return {
          termination_json: updateData as any,
        }
      }
    }

    const employee = await prisma.trans_employees.update({
      where: { id },
      data: {
        ...newJSON(),
        updated_at: toGMT8().toISOString(),
      },
    });

    return employee;
  } catch (error) {
    console.error("Status update failed:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}