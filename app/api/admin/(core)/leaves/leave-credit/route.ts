import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {getPaginatedData} from "@/server/pagination/paginate"; // Import the reusable function
import {LeaveBalance} from "@/types/leaves/leave-credits-types";
import {Decimal} from "@prisma/client/runtime/library";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {toDecimals} from "@/helper/numbers/toDecimals";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');  // Default to page 1
        const perPage = parseInt(searchParams.get('limit') || '5');  // Default to 15 results per page

        // Use the reusable pagination function with Prisma model
        const {data, totalItems, currentPage} = await getPaginatedData<LeaveBalance>(
            prisma.dim_leave_balances,  // The Prisma model
            page, perPage, {deleted_at: null},  // Filtering condition
            {created_at: 'asc'}  // Order by name
        );

        const groupedLeaveEarnings = await prisma.fact_leave_earnings.groupBy({
            by: ['employee_id'],
        });

        const detailedEarnings = await Promise.all(
            groupedLeaveEarnings.map(async (earning) => {
                const employeeData = await prisma.trans_employees.findUnique({
                    where: {
                        id: earning.employee_id,
                    },
                    include: {
                        fact_leave_earnings_fact_leave_earnings_employee_idTotrans_employees: {
                            include: {
                                ref_leave_types: true,
                            }
                        },
                        dim_leave_balances: true,
                    },
                });
                const emp = getEmpFullName(employeeData)
                // Create a mapping of leave_type_id to their respective earned_days
                const earningsMap: { [key: number]: { leave_type_name: string; leave_type_code: string; earned_days: number } } = {};

                employeeData?.fact_leave_earnings_fact_leave_earnings_employee_idTotrans_employees?.forEach(item => {
                    const leaveTypeId = item.leave_type_id;
                    const leaveTypeName = item.ref_leave_types?.name;
                    const earnedDays = toDecimals(item.earned_days);

                    if (earningsMap[leaveTypeId]) {
                        earningsMap[leaveTypeId].earned_days += earnedDays;
                    } else {
                        earningsMap[leaveTypeId] = {
                            leave_type_name: leaveTypeName,
                            leave_type_code: item.ref_leave_types?.code,
                            earned_days: earnedDays,
                        };
                    }
                });

                // Convert the earningsMap to an array
                const leave_earnings = Object.values(earningsMap);
                const leave_balances = employeeData?.dim_leave_balances.map(({total_earned_days, ...balance}) => ({
                    ...balance,
                    total_earned_days: toDecimals(total_earned_days),
                }))
                const res = {
                    name: emp,
                    picture: employeeData?.picture,
                    leave_balance: leave_balances,
                    earnings: {
                        leave_type: leave_earnings, // Include the aggregated earnings
                    },
                };
                return {
                    employee: res,
                };
            })
        );

        return NextResponse.json({
            detailedEarnings

        })
    } catch (err) {
        console.error("Error: ", err);
        return NextResponse.error();
    }
}
