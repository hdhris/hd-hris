import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  // const { searchParams } = new URL(req.url);
  // const type = searchParams.get("type");
  try {
    // const body = await req.json();
    // const payheads = await prisma.ref_payheads.findMany({
    //     where : {
    //       type: type,
    //       deleted_at: null,
    //     },
    // })
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}