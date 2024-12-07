import {Button, Container, Heading, Link, Text} from '@react-email/components';
import FlexibleEmailTemplate from "@/app/email/notification-email";

export default function PreviewFlexibleEmail() {
    return (
        <FlexibleEmailTemplate>
            <Text className="text-gray-800 mb-4">
                Dear John,
            </Text>
            <Text className="text-gray-800 mb-4">
                A new leave type has been added to our system.
            </Text>
            <Text className="font-semibold text-gray-800 mb-4">New Leave Type Summary</Text>
            <Text className="text-gray-800 mb-2">1. A new leave type has been added to the system.</Text>
            <Text className="text-gray-800 mb-2">2. Review the details of the new leave type below.</Text>
            <Text className="text-gray-800 mb-4">3. Update your leave policies if applicable.</Text>
            <Text className="text-gray-800 mt-6">
                For any questions, contact our support team at{" "}
                <Link href="mailto:support@example.com" className="text-blue-600 underline">
                    support@example.com
                </Link>.
            </Text>

        </FlexibleEmailTemplate>
    );
}



