import prisma from "@/prisma/prisma";
import {auth} from "@/auth";

interface NotifyProps {
    title: string
    message: string
    to: string
    status: "warning" | "info" | "success" | "error"
    notification_type: "System Alert" | "Task Assignment" | "Reminder" | "Message" | "Announcement" | "Warning" | "Error" | "Promotion"
    link?: string
}

export const notify = async ({title, message, to, status, notification_type, link}: NotifyProps) => {

    const user_id = await auth()
    await prisma.$transaction(async (tx) => {
        const notification_type_id = await tx.sys_notification_types.findFirst({
            where: {
                type_name: notification_type
            },
            select: {
                id: true
            }
        })
        await tx.sys_notifications.create({
            data: {
                from: user_id?.user.id!,
                title,
                message,
                to,
                status,
                link,
                notification_types_id: notification_type_id?.id!
            }
        })
    })

}