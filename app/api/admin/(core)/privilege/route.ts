import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';
import { emp_rev_include } from '@/helper/include-emp-and-reviewr/include';

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const sys_privileges = await prisma.sys_privileges.findMany({
        where: {
          deleted_at: null,
        },
        include: {
          acl_user_access_control: {
            select: {
              trans_employees: {
                where: {
                  deleted_at: null,
                },
                ...emp_rev_include.minor_detail,
              }
            }
          }
        }
    })
    return NextResponse.json(sys_privileges);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}