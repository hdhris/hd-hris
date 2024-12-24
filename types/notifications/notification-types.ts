export interface NotificationDetails{
    id: number,
    from: {
        name: string,
        picture: string
    },
    title: string
    message: string,
    status: string,
    notification_type: string
    notification_type_description: string,
    is_read: boolean,
    timestamp: string
}

export interface SystemNotification {
    notifications: NotificationDetails[]
    count: number
}