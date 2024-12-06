import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';
import { emp_rev_include } from '@/helper/include-emp-and-reviewr/include';

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const criterias = await prisma.ref_performance_criterias.findMany({
        where: {
            deleted_at: null,
        }
    })
    return NextResponse.json(criterias);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}