import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { toGMT8 } from "../../../../lib/utils/toGMT8";

export async function seedNotificationTypes(prisma: any) {
    console.log("Seeding Notification Type...");
    const notif_type = [
        {
            "type_name": "System Alert",
            "description": "General system-related notifications."
        },
        {
            "type_name": "Task Assignment",
            "description": "Notifications for new tasks assigned."
        },
        {
            "type_name": "Reminder",
            "description": "Notification to remind about deadlines."
        },
        {
            "type_name": "Message",
            "description": "Notifications for new messages."
        },
        {
            "type_name": "Announcement",
            "description": "Organization-wide announcements."
        },
        {
            "type_name": "Warning",
            "description": "Notifications for warnings or issues."
        },
        {
            "type_name": "Error",
            "description": "Notifications for critical errors."
        },
        {
            "type_name": "Promotion",
            "description": "Promotional notifications or offers."
        }
    ]
    // Upsert privileges concurrently
    await Promise.all(
        notif_type.map((nt) =>
            prisma.sys_notification_types.create({
                data: {...nt},
            })
        )
    );

    console.log("Seeding Notification Type completed successfully.");
}

// // Execute the function if the file runs standalone
// if (require.main === module) {
//     seedSysPrivileges()
//         .then(async () => {
//             await prisma.$disconnect();
//         })
//         .catch(async (e) => {
//             console.error("Error seeding sys_privileges:", e);
//             await prisma.$disconnect();
//             process.exit(1);
//         });
// }
