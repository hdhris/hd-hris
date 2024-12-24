import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import {NextResponse} from "next/server";
import {auth} from "@/auth";
import prisma from "@/prisma/prisma";
import {NotificationDetails, SystemNotification} from "@/types/notifications/notification-types";
import {toGMT8} from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic";


export async function GET() {
    try {
        const user = await auth();
        const user_id = user?.user.id;

        if (!user_id) {
            return NextResponse.json({error: "User not authenticated"}, {status: 401});
        }

        // Combine the notification fetch and count queries
        const [notifications, count] = await Promise.all([prisma.sys_notifications.findMany({
            where: {
                to: user_id,
                deleted_at: null
            }, select: {
                created_at: true, read_at: true, id: true, // Adjust to fetch only the fields you need

                status: true, message: true, // Replace with required fields
                title: true, trans_users_sys_notifications_fromTotrans_users: {
                    select: {
                        image: true, name: true, // Replace with required fields
                    },
                }, sys_notification_types: {
                    select: {
                        type_name: true, // Replace with required fields
                        description: true
                    },
                },
            },
        }), prisma.sys_notifications.count({
            where: {
                to: user_id, deleted_at: null
            },
        }),]);

        const notify: NotificationDetails[] = notifications
            .map((notification) => ({
                id: notification.id,
                from: {
                    name: notification?.trans_users_sys_notifications_fromTotrans_users?.name,
                    picture: notification?.trans_users_sys_notifications_fromTotrans_users?.image ?? "",
                },
                title: notification?.title,
                message: notification?.message,
                status: notification?.status,
                notification_type: notification?.sys_notification_types?.type_name,
                notification_type_description: notification?.sys_notification_types?.description,
                is_read: notification.read_at !== null,
                timestamp: toGMT8(notification.created_at).toISOString(),
            }))

        return NextResponse.json({notifications: notify, count} as unknown as SystemNotification);
    } catch (error) {
        return getPrismaErrorMessage(error);
    }
}
