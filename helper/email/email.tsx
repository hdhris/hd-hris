import {auth} from "@/auth";
import {Link, render, Text} from '@react-email/components';
import FlexibleEmailTemplate from "@/app/email/notification-email";

export async function generateEmailBody({
    name,
    message,
}: {
    name: string;
    message: string;
}){
    const email = await render(<FlexibleEmailTemplate>
        <Text className="text-gray-800 mb-4">
            Dear {name},
        </Text>
        <Text className="text-gray-800 mb-4">
            {message}
        </Text>
        <Text className="text-gray-800 mt-6">
            {"If you have any questions or require further assistance, please feel free to reach out to us at "}
            <Link href="mailto:support@example.com" className="text-blue-600 underline">
                support@example.com
            </Link>.
        </Text>
    
    </FlexibleEmailTemplate>)

    return email;
}