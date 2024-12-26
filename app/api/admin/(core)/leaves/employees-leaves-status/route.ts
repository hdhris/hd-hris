import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {EmployeeLeave, EmployeeLeavesStatus, LeaveType} from "@/types/leaves/LeaveRequestTypes";
import {toDecimals} from "@/helper/numbers/toDecimals";
import {employee_validation} from "@/server/employee-details-map/employee-details-map";

export const dynamic = "force-dynamic";

export async function GET() {
    const [emp, leaveTypes] = await Promise.all([prisma.trans_employees.findMany({
        where: {
            ...employee_validation,
            dim_leave_balances: {
                some: {
                    remaining_days: {
                        gt: 0
                    }, deleted_at: null
                }
            }, dim_schedules: {
                some: {
                    end_date: null
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
                    }, deleted_at: null
                }
            },
            trans_leaves_trans_leaves_employee_idTotrans_employees: true,
            dim_schedules: {
                select: {
                    days_json: true, ref_batch_schedules: {
                        select: {
                            clock_in: true, clock_out: true, break_min: true
                        }
                    }
                }
            }
        }
    }),

        prisma.trans_leave_types.findMany({
            where: {
                deleted_at: null, ref_leave_type_details: {
                    is_active: true,
                }
                // is_active: true,
                // trans_leave_types:{
                //     some: {
                //         deleted_at: null
                //     }
                // }
            }, select: {
                id: true, ref_leave_type_details: {
                    select: {
                        name: true, max_duration: true, attachment_required: true
                    }
                }
            },
        }),]);

    // console.log("Leave Balance: ", emp.find((emp) => emp.id)?.dim_leave_balances)

    const employees: EmployeeLeave[] = emp.map((emp: any) => ({
        id: emp.id,
        name: getEmpFullName(emp),
        picture: emp.picture,
        department: emp.ref_departments.name,
        leave_balances: emp.dim_leave_balances.map((leaveBalance: any) => ({
            leave_type_id: leaveBalance.leave_type_id,
            year: leaveBalance.year,
            remaining_days: toDecimals(leaveBalance.remaining_days),
            carry_forward_days: toDecimals(leaveBalance.carry_forward_days),
        })),
        trans_leaves: emp.trans_leaves_trans_leaves_employee_idTotrans_employees,
        dim_schedules: emp.dim_schedules
    }));


    const availableLeaves: LeaveType[] = leaveTypes.map((leave) => ({
        id: leave.id,
        name: leave.ref_leave_type_details.name,
        max: toDecimals(leave.ref_leave_type_details.max_duration),
        is_attachment_required: leave.ref_leave_type_details.attachment_required
    }))

    const data: EmployeeLeavesStatus = {
        employees, availableLeaves
    }
    return NextResponse.json(data);
}
