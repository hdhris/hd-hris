import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { getAttachmentMetadata } from "@/helper/file/getFileMetadata";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    try {
        const cash_advance = await prisma.trans_cash_advances.findMany({
            where: {
                deleted_at: null,
            },
            include: {
                trans_cash_advance_disbursements: {
                    where: { deleted_at: null },
                    include: {
                        trans_cash_advance_repayments: {
                            where: { deleted_at: null },
                        },
                    },
                },
                trans_employees_trans_cash_advances_employee_idTotrans_employees: {
                    ...emp_rev_include.employee_detail,
                },
            },
        });

        const modifiedCashAdvance = await Promise.all(
            cash_advance.map(async (item) => {
                const meta_files = await getAttachmentMetadata(item.files as string[]);
                return {
                    ...item,
                    meta_files, // Attach the resolved metadata
                };
            })
        );
        return NextResponse.json(modifiedCashAdvance);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
