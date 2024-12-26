import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';
import { emp_rev_include } from '@/helper/include-emp-and-reviewr/include';
import { isEmployeeAvailable } from '@/helper/employee/unavailableEmployee';

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const findEmployees = await prisma.trans_employees.findMany({
        where: {
            deleted_at: null,
        },
        select: {
          ...emp_rev_include.basic_detail.select,
        }
    })
    const filteredEmplyoees = findEmployees.filter(emp => isEmployeeAvailable(emp as any))
    return NextResponse.json(filteredEmplyoees);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}