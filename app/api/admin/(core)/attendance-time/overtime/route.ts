import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { getPaginatedData } from "@/server/pagination/paginate";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { getAttachmentMetadata } from "@/helper/file/getFileMetadata";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
    try {
        const overtimes = await prisma.trans_overtimes.findMany({
            where: {
                deleted_at: null,
                trans_employees_overtimes: {
                    deleted_at: null,
                },
            },
            orderBy: {
                updated_at: "desc",
            },
            include: {
                trans_employees_overtimes: {
                    ...emp_rev_include.employee_detail,
                },
                trans_employees_overtimes_createdBy: {
                    ...emp_rev_include.minor_detail,
                },
            },
        });

        const modifiedOvertimes = await Promise.all(
            overtimes.map(async (item) => {
                const meta_files = await getAttachmentMetadata(item.files as string[]);
                return {
                    ...item,
                    meta_files, // Attach the resolved metadata
                };
            })
        );
        return NextResponse.json(modifiedOvertimes);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
