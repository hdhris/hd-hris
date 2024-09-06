import {NextResponse} from "next/server";
import {LoginActivity} from "@/types/routes/default/types";

export async function GET() {
    const loginActivities: LoginActivity[] = [
        {
            key: "1",
            device_name: "iPhone 12",
            device_icon: "📱",
            platform: "iOS",
            date: "2024-08-25",
            time: "09:15 AM",
            ip_address: "192.168.1.10",
            location: "New York, USA",
            access_method: "Browser",
        },
        {
            key: "2",
            device_name: "Samsung Galaxy S21",
            device_icon: "📱",
            platform: "Android",
            date: "2024-08-25",
            time: "12:30 PM",
            ip_address: "192.168.1.11",
            location: "Los Angeles, USA",
            access_method: "Android App",
        },
        {
            key: "3",
            device_name: "MacBook Pro",
            device_icon: "💻",
            platform: "macOS",
            date: "2024-08-24",
            time: "03:45 PM",
            ip_address: "192.168.1.12",
            location: "San Francisco, USA",
            access_method: "Browser",
        },
        {
            key: "4",
            device_name: "Dell XPS 13",
            device_icon: "💻",
            platform: "Windows",
            date: "2024-08-24",
            time: "08:00 AM",
            ip_address: "192.168.1.13",
            location: "Seattle, USA",
            access_method: "Browser",
        },
        {
            key: "5",
            device_name: "iPad Pro",
            device_icon: "📱",
            platform: "iPadOS",
            date: "2024-08-23",
            time: "07:30 PM",
            ip_address: "192.168.1.14",
            location: "Chicago, USA",
            access_method: "Browser",
        },
    ];
    return NextResponse.json(loginActivities)
}