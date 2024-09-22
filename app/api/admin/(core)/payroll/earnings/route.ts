import { NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const earning = await prisma.ref_payheads.findMany({
        where : {
            AND:{
                type: "earning",
                deleted_at: null
            }
        }
    })
    return NextResponse.json(earning);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}