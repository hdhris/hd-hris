import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import dayjs from "dayjs";
import {LeaveRequest} from "@/types/leaves/LeaveRequestTypes";
import {EvaluatorsTypes, LeaveApplicationEvaluation} from "@/types/leaves/leave-evaluators-types";
import {processJsonObject} from "@/lib/utils/parser/JsonObject";

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
            }, ref_leave_types: {
                select: {
                    id: true, name: true, code: true
                }
            }
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
        const evaluators = processJsonObject<LeaveApplicationEvaluation>(items.evaluators)!
        const approverDecision = evaluators.approver.decision.is_approved;
        const reviewerDecision = evaluators.reviewers?.decision.is_reviewed;

// Determine the status based on the decisions
        let status = "Approved"; // Default status is "Approved"

        if (approverDecision === null || reviewerDecision === null) {
            status = "Pending"; // If either the approver or reviewer has not made a final decision
        } else if (!approverDecision || !reviewerDecision) {
            status = "Rejected"
        }

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
                start_date: dayjs(items.start_date).format("MMM DD, YYYY hh:mm A"),
                end_date: dayjs(items.end_date).format("MMM DD, YYYY hh:mm A"),
                total_days: dayjs(items.end_date).diff(items.start_date, 'day'),
                reason: items.reason || "",
                status: status as "Approved" | "Pending" | "Rejected",
                created_at: dayjs(items.created_at).format("YYYY-MM-DD"),
                updated_at: dayjs(items.updated_at).format("YYYY-MM-DD"),
            },
            leave_type: {
                id: items.ref_leave_types?.id!,
                name: items.ref_leave_types?.name || "",
                code: items.ref_leave_types?.code || ""
            },
            evaluators: processJsonObject<LeaveApplicationEvaluation>(items.evaluators)!,
        }

    })
    return NextResponse.json({
        data: employees_request, totalItems,
    })
}