import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date_id = Number(searchParams.get("date_id"));
  const employee_id = Number(searchParams.get("employee_id"));
  try {
    // const body = await req.json();
    const date = await prisma.trans_payhead_breakdowns.findMany({
        where : {
          trans_payrolls: {
            date_id,
            employee_id,
          }
        },
        select: {
          amount: true,
          ref_payheads: {
            select: {
              name: true,
              type: true,
            }
          }
        }
    })
    return NextResponse.json(date);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}