import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { LeaveRequest } from "@/types/leaves/LeaveRequestTypes";
import { processJsonObject } from "@/lib/utils/parser/JsonObject";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { formatDaysToReadableTime } from "@/lib/utils/timeFormatter";
import { Evaluations } from "@/types/leaves/leave-evaluators-types";
import {getFileMetadataFromUrlWithBlob} from "@/helper/file/getFileMetadata";

export const dynamic = "force-dynamic";

async function getAttachmentMetadata(urls: string[]) {
    const metadataPromises = urls.map(async (url) => {
        try {
            return await getFileMetadataFromUrlWithBlob(url);

        } catch (error) {
            console.error(`Failed to fetch metadata for ${url}:`, error);
            throw error;
        }
    });

    return Promise.all(metadataPromises);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("limit") || "15");

    const data = await prisma.trans_leaves.findMany({
        where: {
            deleted_at: null,
        },
        include: {
            trans_employees_leaves: {
                select: {
                    email: true,
                    prefix: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    suffix: true,
                    extension: true,
                    picture: true,
                    dim_schedules: {
                        where: {
                          end_date: null,
                        },
                        select: {
                            days_json: true,
                            ref_batch_schedules: {
                                select: {
                                    clock_in: true, clock_out: true, break_min: true
                                }
                            }
                        }
                    }
                },
            },
            trans_employees_trans_leaves_created_byTotrans_employees: {
                select: {
                    id: true,
                    picture: true,
                    email: true,
                    prefix: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    suffix: true,
                },
            },
            trans_leave_types: {
                include: {
                    ref_leave_type_details: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            updated_at: "desc",
        },
        take: perPage,
        skip: (page - 1) * perPage,
    });

    const totalItems = await prisma.trans_leaves.count({
        where: {
            deleted_at: null,
        },
    });

    const employeesRequest:LeaveRequest[] = await Promise.all(
        data.map(async (item) => {
            const attachmentUrls = item.files as string[] || [];
            const attachmentMetadata = await getAttachmentMetadata(attachmentUrls);

            return {
                id: item.id,
                employee_id: item.employee_id,
                name: getEmpFullName(item.trans_employees_leaves),
                email: item.trans_employees_leaves.email || "",
                picture: item.trans_employees_leaves.picture || "",
                schedule: {
                    days_json: item.trans_employees_leaves.dim_schedules.map(days => days.days_json as string),
                    ref_batch_schedules: item.trans_employees_leaves.dim_schedules.map(time => ({
                        clock_in: time.ref_batch_schedules?.clock_in?.toISOString()!, // ISO date string
                        clock_out: time.ref_batch_schedules?.clock_out?.toISOString()!, // ISO date string
                        break_min: time.ref_batch_schedules?.break_min!
                    }))[0]
                },
                created_by: {
                    id: item.trans_employees_trans_leaves_created_byTotrans_employees?.id!,
                    email: item.trans_employees_trans_leaves_created_byTotrans_employees?.email || "",
                    picture: item.trans_employees_trans_leaves_created_byTotrans_employees?.picture || "",
                    name: getEmpFullName(item.trans_employees_trans_leaves_created_byTotrans_employees),
                },
                leave_details: {
                    start_date: item.start_date?.toISOString(),
                    end_date:item.end_date?.toISOString(),
                    reason: item.reason || "",
                    status: item.status as "Approved" | "Pending" | "Rejected",
                    total_days: formatDaysToReadableTime(item.total_days.toNumber()),
                    created_at: toGMT8(item.created_at.toISOString()).format("YYYY-MM-DD hh:mm A"),
                    updated_at: toGMT8(item.updated_at.toISOString()).format("YYYY-MM-DD hh:mm A"),
                },
                leave_type: {
                    id: item.trans_leave_types?.ref_leave_type_details?.id!,
                    name: item.trans_leave_types?.ref_leave_type_details?.name || "",
                    code: item.trans_leave_types?.ref_leave_type_details?.code || "",
                    attachments: attachmentMetadata,
                },
                evaluators: processJsonObject<Evaluations>(item.evaluators)!,
            };
        })
    );

    return NextResponse.json({
        data: employeesRequest,
        totalItems,
    });
}
