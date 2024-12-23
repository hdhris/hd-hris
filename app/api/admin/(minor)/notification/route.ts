import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import {getEmployeeById} from "@/app/api/employeemanagement/employees/read";
import {NextResponse} from "next/server";
import {getEmployeeId} from "@/server/getEmployeeId";
import {auth, signOut} from "@/auth";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";

export async function GET(){
    try {
        const user = await auth()
        const user_id = user?.user.id
        // if(!user_id){
        //     await signOut()
        // }
        const notification = await prisma.sys_notifications_status.findMany({
            where: {
                sys_notification_contents: {
                    to: user_id
                }
            },
            include: {
                sys_notification_contents: {
                    include: {
                        trans_users: true,
                        sys_notification_types: true
                    }
                },

            }
        })
        return NextResponse.json({notification})
    } catch (error) {
        return getPrismaErrorMessage(error)
    }
}