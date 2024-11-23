import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
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
                    email: true, prefix: true, first_name: true, last_name: true, middle_name: true, suffix: true,
                }
            }, ref_leave_types: {
                select: {
                    id: true,
                    name: true,
                    code: true
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

    const employees_request = data.map(items => {
        return {
            id: items.id,
            employee_id: items.employee_id,
            name: getEmpFullName(items.trans_employees_leaves),
            email: items.trans_employees_leaves?.email,
            picture: items.trans_employees_leaves?.picture,
            created_by: {
                id: items.trans_employees_trans_leaves_created_byTotrans_employees?.id,
                name: getEmpFullName(items.trans_employees_trans_leaves_created_byTotrans_employees),
                picture: items.trans_employees_trans_leaves_created_byTotrans_employees?.picture,
            },
            leave_type: {
                id: items.ref_leave_types?.id,
                name: items.ref_leave_types?.name,
                code: items.ref_leave_types?.code
            },
            leave_details: {
                start_date: items.start_date,
                end_date: items.end_date,
                total_days: dayjs(items.end_date).diff(items.start_date, 'day'),
                comment: items.comment,
                reason: items.reason,
                attachment: items.attachment_json,
                created_at: items.created_at,
                updated_at: items.updated_at
            },
            evaluators: items.evaluators,

        }
    })

    return NextResponse.json({
        data: employees_request, totalItems,
    })
}