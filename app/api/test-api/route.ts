import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import {notify} from "@/services/notification-services";
import {NextResponse} from "next/server";

export async function GET() {
    try {
        await notify({title: "Test", message: "This is a test...", to: "b29dc305-4269-40a8-a360-d8724ed91688", status: "info", notification_type: "Message"})
        return NextResponse.json({success: true, message: "Notification sent successfully."}, {status: 200});
    } catch (error) {
        return getPrismaErrorMessage(error)
    }
}