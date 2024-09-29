

import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import {Prisma} from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);

    const skip = (page - 1) * limit;

    const emp = await prisma.trans_employees.findMany({
        where: {
            deleted_at: null,
            resignation_json: {
                equals: Prisma.DbNull
            },
            termination_json: {
                equals: Prisma.DbNull
            }
        },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            picture: true,
            ref_departments: {
                select: {
                    name: true
                }
            }
        },
        skip,
        take: limit,
    });

    const totalEmployees = await prisma.trans_employees.count({
        where: {
            deleted_at: null,
            resignation_json: {
                equals: Prisma.DbNull
            },
            termination_json: {
                equals: Prisma.DbNull
            }
        }
    });

    const totalPages = Math.ceil(totalEmployees / limit);

    return NextResponse.json({
        data: emp,
        meta: {
            currentPage: page,
            totalPages
        }
    });
}
