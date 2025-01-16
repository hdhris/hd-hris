export async function notificationTypes(prisma: any){
    console.log("Creating Notification Types...");

    const notification_types = [
        {
            "id": 1,
            "type_name": "System Alert",
            "description": "General system-related notifications."
        },
        {
            "id": 2,
            "type_name": "Task Assignment",
            "description": "Notifications for new tasks assigned."
        },
        {
            "id": 3,
            "type_name": "Reminder",
            "description": "Notification to remind about deadlines."
        },
        {
            "id": 4,
            "type_name": "Message",
            "description": "Notifications for new messages."
        },
        {
            "id": 5,
            "type_name": "Announcement",
            "description": "Organization-wide announcements."
        },
        {
            "id": 6,
            "type_name": "Warning",
            "description": "Notifications for warnings or issues."
        },
        {
            "id": 7,
            "type_name": "Error",
            "description": "Notifications for critical errors."
        },
        {
            "id": 8,
            "type_name": "Promotion",
            "description": "Promotional notifications or offers."
        }
    ]

    await prisma.sys_notification_types.createMany({
        data: notification_types
    })

    console.log("Finished Notification Types...");

}