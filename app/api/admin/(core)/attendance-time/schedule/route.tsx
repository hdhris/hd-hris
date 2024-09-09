import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const batchData = await prisma.ref_batch_schedules.findMany();
    const employeeSchedule = await prisma.dim_schedules.findMany({
      include:{
        trans_employees:{
          select: {
            last_name: true,
            first_name: true,
            middle_name: true,
          }
        }
      }
    })
    return NextResponse.json({ 
      batch: batchData,
      emp_sched: employeeSchedule,
     });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}