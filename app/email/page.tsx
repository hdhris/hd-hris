import { Button, Text } from '@react-email/components';
import FlexibleEmailTemplate from "@/app/email/notification-email";

export default function PreviewFlexibleEmail() {
    return (
        <FlexibleEmailTemplate
            previewText="Welcome to Acme Inc. - Your account has been created!"
        >
            <Text style={paragraph}>
                Hello valued customer,
            </Text>
            <Text style={paragraph}>
                We&apos;re excited to inform you that your account has been successfully created. Welcome to the Acme Inc. family!
            </Text>
            <Text style={paragraph}>
                To get started, please click the button below to verify your email address and set up your account preferences.
            </Text>
            <Button
                style={button}
                href="https://acme.com/verify-email"
            >
                Verify Email Address
            </Button>
            <Text style={paragraph}>
                If you have any questions or need assistance, please don&apos;t hesitate to reach out to our support team.
            </Text>
            <Text style={paragraph}>
                Best regards,<br />
                The Acme Inc. Team
            </Text>
        </FlexibleEmailTemplate>
    );
}

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#484848',
};

const button = {
    backgroundColor: '#5F51E8',
    borderRadius: '3px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px',
};

