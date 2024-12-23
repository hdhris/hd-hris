import { useEffect } from 'react';
import { mutate } from 'swr';
import {useNotification} from "@/services/queries";

function ReceivedNotification() {
    const { data: notifications } = useNotification();

    useEffect(() => {
        // Replace with your localhost WebSocket server
        const socket = new WebSocket('ws://localhost:3000/api/admin/notification');

        socket.onmessage = (event) => {
            try {
                const updatedNotifications = JSON.parse(event.data);
                // Update SWR cache with new notifications
                mutate('/api/admin/notification', updatedNotifications, false); // `false` avoids revalidation
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        // Cleanup WebSocket connection on unmount
        return () => {
            socket.close();
        };
    }, []);

    return <pre>{JSON.stringify(notifications, null, 2)}</pre>;
}

export default ReceivedNotification;
