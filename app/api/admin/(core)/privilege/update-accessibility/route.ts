import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        // console.log(body);
        const [updatedPrivilege, allLoggedOut] = await prisma.$transaction([
            prisma.sys_privileges.update({
                where: {
                    id: body.id,
                },
                data: {
                    accessibility: body.accessibility,
                    updated_at: toGMT8().toISOString(),
                },
            }),

            prisma.sec_devices.updateMany({
                where: {
                    acl_user_access_control: {
                        sys_privileges: {
                            id: body.id,
                        },
                    },
                },
                data: {
                    is_logged_out: true,
                    updated_at: toGMT8().toISOString(),
                },
            }),
        ]);

        return NextResponse.json({ updatedPrivilege, allLoggedOut }, { status: 200 });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
