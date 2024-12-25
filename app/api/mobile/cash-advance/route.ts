import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const employee_id = Number(searchParams.get("employee_id"));
    try {
        // const body = await req.json();
        const cash_advance = await prisma.trans_cash_advances.findMany({
            where: {
                deleted_at: null,
                employee_id: employee_id,
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
            },
            orderBy: {
              updated_at: 'desc'
            }
        });
        return NextResponse.json(cash_advance);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
