import prisma from "@/prisma/prisma"
import {sendEmail} from "@/services/email-services";
import {auth} from "@/auth";
import {Link, render, Text} from '@react-email/components';
import FlexibleEmailTemplate from "@/app/email/notification-email";

export const automateAddingLeaveType = async (id: string | number) => {
    const session = await auth()
    const is_applicable_to_all = await prisma.ref_leave_type_details.findMany({
        where: {
            trans_leave_types: {
                some: {
                    deleted_at: null
                }
            }
        }
    })

    const email = await render(<FlexibleEmailTemplate>
        <Text className="text-gray-800 mb-4">
            Dear {session?.name},
        </Text>
        <Text className="text-gray-800 mb-4">
            A new leave type has been added to our system.
        </Text>
        <Text className="font-semibold text-gray-800 mb-4">New Leave Type Summary</Text>
        {/*<Text className="text-gray-800 mb-2">{JSON.stringify(is_applicable_to_all.filter(item => item.is_applicable_to_all).map(item => item.name.concat(" ")))}</Text>*/}
        {/*<Text className="text-gray-800 mb-2">2. Review the details of the new leave type below.</Text>*/}
        {/*<Text className="text-gray-800 mb-4">3. Update your leave policies if applicable.</Text>*/}
        <Text className="text-gray-800 mt-6">
            For any questions, contact our support team at
            <Link href="mailto:support@example.com" className="text-blue-600 underline">
                support@example.com
            </Link>.
        </Text>

    </FlexibleEmailTemplate>)
    // for (const item of is_applicable_to_all) {
    //     if (item.is_applicable_to_all) {
    //
    //         console.log("sending");
    //         //TODO: this is for testing
    //         await sendEmail({
    //             to: "xerojohn7@gmail.com", subject: "Action Required: Review and Add New Leave Type", html: email
    //         })
    //     }
    // }
}

