import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employee_id = Number(searchParams.get("employee_id"));
  try {
    // const body = await req.json();
    const date = await prisma.trans_payroll_date.findMany({
        where : {
          deleted_at: null,
          is_processed: true,
          trans_payrolls: {
            some: {
              employee_id: employee_id,
            }
          }
        },
        orderBy: {
          start_date: 'desc'
        }
    })
    return NextResponse.json(date);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}