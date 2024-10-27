import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {getPaginatedData} from "@/server/pagination/paginate";
import {LeaveType} from "@/types/leaves/LeaveTypes";

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
    // const data = await prisma.trans_leaves.findMany({
    //     include: {
    //         trans_employees_leaves: {
    //             select: {
    //                 email: true,
    //                 prefix: true,
    //                 first_name: true,
    //                 last_name: true,
    //                 middle_name: true,
    //                 suffix: true,
    //                 extension: true,
    //                 picture: true
    //             }
    //         }, trans_employees_leaves_approvedBy: {
    //             select: {
    //                 email: true,
    //                 prefix: true,
    //                 first_name: true,
    //                 last_name: true,
    //                 middle_name: true,
    //                 suffix: true,
    //                 extension: true,
    //                 picture: true
    //             }
    //         }, ref_leave_types: true
    //     }
    // });
    const {searchParams} = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');  // Default to page 1
    const perPage = parseInt(searchParams.get('limit') || '15');  // Default to 15 results per page

    // Use the reusable pagination function with Prisma model
    const {data, totalItems} = await getPaginatedData<LeaveType>(prisma.trans_leaves,  // The Prisma model
        page, perPage, {deleted_at: null},  // Filtering condition
        {
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
            }, trans_employees_leaves_approvedBy: {
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
            }, ref_leave_types: true

        }, {created_at: 'desc'}
    );

    // const leaves_request = data.map((item) => {
    //     return {
    //         id: item.id!, ...item
    //     }
    // })

    return NextResponse.json({
        data, totalItems,
    })
}