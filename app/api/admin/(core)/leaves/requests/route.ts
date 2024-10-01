import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {LeaveRequestTypes} from "@/types/leaves/LeaveRequestTypes";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import dayjs from "dayjs";


export async function GET() {
    const data = await prisma.trans_leaves.findMany({
        where: {
            end_date: {
                lt: new Date()
            }
        }, include: {
            trans_employees_leaves: {
                select: {
                    prefix: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    suffix: true,
                    extension: true,
                    picture: true
                }
            },
            trans_employees_leaves_approvedBy: {
                select: {
                    prefix: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    suffix: true,
                    extension: true,
                    picture: true
                }
            },
            ref_leave_types: true
        }
    });

    return NextResponse.json(data)
}