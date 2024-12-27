import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {LeaveRequest} from "@/types/leaves/LeaveRequestTypes";
// import {LeaveApplicationEvaluation} from "@/types/leaves/leave-evaluators-types";
import {processJsonObject} from "@/lib/utils/parser/JsonObject";
import {toGMT8} from "@/lib/utils/toGMT8";
import {formatDaysToReadableTime} from "@/lib/utils/timeFormatter";
import {Evaluations} from "@/types/leaves/leave-evaluators-types";
import dayjs from "dayjs";

export const dynamic = "force-dynamic"


export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');  // Default to page 1
    const perPage = parseInt(searchParams.get('limit') || '15');  // Default to 15 results per page

    const data = await prisma.trans_leaves.findMany({
        where: {
            deleted_at: null
        }, include: {
            trans_employees_leaves: {
                select: {
                    email: true,
                    prefix: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    suffix: true,
                    extension: true,
                    picture: true
                }
            }, trans_employees_trans_leaves_created_byTotrans_employees: {
                select: {
                    id: true,
                    picture: true,
                    email: true,
                    prefix: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    suffix: true,
                }
            }, trans_leave_types: {
                select: {
                    ref_leave_type_details: {
                        select: {
                            id: true, name: true, code: true
                        }
                    }
                }
            },

        }, orderBy: {
            updated_at: 'desc'
        }, take: perPage, skip: (page - 1) * perPage
    })

    const totalItems = await prisma.trans_leaves.count({
        where: {
            deleted_at: null
        }
    })


    const employees_request: LeaveRequest[] = data.map(items => {
        // const evaluators = processJsonObject<LeaveApplicationEvaluations>(items.evaluators)!
        // const approverDecision = evaluators.approver.decision.is_approved;
        // const reviewerDecision = evaluators.reviewers?.decision.is_reviewed;

        // // Determine the status based on the decisions
        // let status = "Approved"; // Default status is "Approved"
        //
        // if (approverDecision === null || reviewerDecision === null) {
        //     status = "Pending"; // If either the approver or reviewer has not made a final decision
        // } else if (!approverDecision || !reviewerDecision) {
        //     status = "Rejected"
        // }

        // console.dir(items.evaluators, {depth: 4})
        return {
            id: items.id,
            employee_id: items.employee_id,
            name: getEmpFullName(items.trans_employees_leaves),
            email: items.trans_employees_leaves.email || "",
            picture: items.trans_employees_leaves.picture || "",
            created_by: {
                id: items.trans_employees_trans_leaves_created_byTotrans_employees?.id!,
                email: items.trans_employees_trans_leaves_created_byTotrans_employees?.email || "",
                picture: items.trans_employees_trans_leaves_created_byTotrans_employees?.picture || "",
                name: getEmpFullName(items.trans_employees_trans_leaves_created_byTotrans_employees)
            },
            leave_details: {
                start_date: toGMT8(items.start_date?.toISOString()).format("MMM DD, YYYY hh:mm A"),
                end_date: toGMT8(items.end_date?.toISOString()).format("MMM DD, YYYY hh:mm A"),
                reason: items.reason || "",
                status: items.status as "Approved" | "Pending" | "Rejected",
                total_days: formatDaysToReadableTime(items.total_days.toNumber()),
                created_at: toGMT8(items.created_at.toISOString()).format("YYYY-MM-DD hh:mm A"),
                updated_at: toGMT8(items.updated_at.toISOString()).format("YYYY-MM-DD hh:mm A"),
            },
            leave_type: {
                id: items.trans_leave_types?.ref_leave_type_details?.id!,
                name: items.trans_leave_types?.ref_leave_type_details?.name || "",
                code: items.trans_leave_types?.ref_leave_type_details?.code || ""
            },
            evaluators: processJsonObject<Evaluations>(items.evaluators)!,
        }

    })


    return NextResponse.json({
        data: employees_request, totalItems,
    })
}