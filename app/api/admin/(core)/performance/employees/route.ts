import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';
import { emp_rev_include } from '@/helper/include-emp-and-reviewr/include';

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const employees = await prisma.trans_employees.findMany({
        where: {
            deleted_at: null,
        },
        select: {
          ...emp_rev_include.minor_detail.select,
        }
    })
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}