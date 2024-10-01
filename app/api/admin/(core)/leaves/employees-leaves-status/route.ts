import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {Prisma} from "@prisma/client";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {EmployeeLeave, EmployeeLeavesStatus, LeaveType} from "@/types/leaves/LeaveRequestTypes";

export async function GET() {
    const [emp, leaveTypes] = await Promise.all([await prisma.trans_employees.findMany({
        where: {
            deleted_at: null, resignation_json: {
                equals: Prisma.DbNull
            }, termination_json: {
                equals: Prisma.DbNull
            }, dim_leave_balances: {
                some: {
                    allocated_days: {
                        gt: 0
                    }, deleted_at: null
                }
            }
        }, select: {
            id: true,
            prefix: true,
            first_name: true,
            last_name: true,
            middle_name: true,
            suffix: true,
            extension: true,
            picture: true,
            ref_departments: {
                select: {
                    name: true
                }
            },
            dim_leave_balances: true
        }
    }), await prisma.ref_leave_types.findMany({
        where: {
            is_active: true
        }, select: {
            id: true, name: true, duration_days: true
        },
    }),]);

    const employees: EmployeeLeave[] = emp.map((emp: any) => ({
        id: emp.id,
        name: getEmpFullName(emp),
        picture: emp.picture,
        department: emp.ref_departments.name,
        leave_balances: {
            year: emp.dim_leave_balances[0].year,
            remaining_days: emp.dim_leave_balances[0].remaining_days,
            carry_forward_days: emp.dim_leave_balances[0].carry_forward_days
        }
    }));

    const availableLeaves: LeaveType[] = leaveTypes.map((leave: any) => ({
        id: leave.id,
        name: leave.name,
        duration_days: leave.duration_days
    }))

    const data: EmployeeLeavesStatus = {
        employees,
        availableLeaves
    }
    return NextResponse.json(data);
}
