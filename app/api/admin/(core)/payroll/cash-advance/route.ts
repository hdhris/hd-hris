import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';
import { emp_rev_include } from '@/helper/include-emp-and-reviewr/include';

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const cash_advance = await prisma.trans_cash_advances.findMany({
        where: {
            deleted_at: null,
        },
        include: {
            trans_cash_advance_disbursements: {
                where : { deleted_at : null},
                include: { 
                    trans_cash_advance_repayments : {
                        where : {deleted_at : null},
                    }
                }
            },
            trans_employees_trans_cash_advances_employee_idTotrans_employees : {
                ...emp_rev_include.employee_detail,
            },
            trans_employees_trans_cash_advances_approval_byTotrans_employees : {
                ...emp_rev_include.reviewer_detail,
            }
        }
    })
    return NextResponse.json(cash_advance);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}