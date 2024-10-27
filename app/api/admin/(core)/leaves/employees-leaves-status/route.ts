import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {Prisma} from "@prisma/client";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {EmployeeLeave, EmployeeLeavesStatus, LeaveType} from "@/types/leaves/LeaveRequestTypes";
import {toDecimals} from "@/helper/numbers/toDecimals";

export const dynamic = "force-dynamic";

export async function GET() {
    const [emp, leaveTypes] = await Promise.all([await prisma.trans_employees.findMany({
        where: {
            deleted_at: null,
            // resignation_json: {
            //     equals: Prisma.DbNull
            // }, termination_json: {
            //     equals: Prisma.DbNull
            // },
            // trans_leaves_trans_leaves_employee_idTotrans_employees: {
            //     some: {
            //         start_date: {
            //             lte: new Date()
            //         },
            //         end_date: {
            //             gte: new Date()
            //         },
            //         // status: {
            //         //     not: "Approved"
            //         // }
            //     }
            // }
            dim_leave_balances: {
                some: {
                    remaining_days: {
                        gt: 0
                    },
                    deleted_at: null
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
            resignation_json: true,
            termination_json: true,
            ref_departments: {
                select: {
                    name: true
                }
            },
            dim_leave_balances: {
                where: {
                    remaining_days: {
                        gt: 0
                    },
                    deleted_at: null
                }
            },
            trans_leaves_trans_leaves_employee_idTotrans_employees: true
        }
    }), await prisma.ref_leave_types.findMany({
        where: {
            is_active: true
        }, select: {
            id: true, name: true, max_duration: true, min_duration: true, attachment_required: true
        },
    }),]);

    // console.log("Leave Balance: ", emp.find((emp) => emp.id)?.dim_leave_balances)

    const employees: EmployeeLeave[] = emp.filter(item => {
        return item.resignation_json === null && item.termination_json === null
    }).map((emp: any) => ({
        id: emp.id,
        name: getEmpFullName(emp),
        picture: emp.picture,
        department: emp.ref_departments.name,
        leave_balances: emp.dim_leave_balances.map((leaveBalance: any) => ({
            year: leaveBalance.year,
            remaining_days: toDecimals(leaveBalance.remaining_days),
            carry_forward_days: toDecimals(leaveBalance.carry_forward_days),
        }))[0],
        trans_leaves: emp.trans_leaves_trans_leaves_employee_idTotrans_employees
    }));


    const availableLeaves: LeaveType[] = leaveTypes.map((leave) => ({
        id: leave.id,
        name: leave.name,
        min: leave.min_duration,
        max: leave.max_duration,
        isAttachmentRequired: leave.attachment_required
    }))

    const data: EmployeeLeavesStatus = {
        employees, availableLeaves
    }
    return NextResponse.json(data);
}
