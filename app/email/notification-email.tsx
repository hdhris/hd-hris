import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface FlexibleEmailTemplateProps {
    companyName: string;
    companyLogo: string;
    companyWebsite: string;
    previewText: string;
    children: React.ReactNode;
}

export const FlexibleEmailTemplate: React.FC<FlexibleEmailTemplateProps> = ({
                                                                                companyName = process.env.APP_NAME,
                                                                                companyLogo = process.env.BASE_URL + "/logo.svg",
                                                                                companyWebsite = process.env.BASE_URL,
                                                                                previewText = 'Important information inside',
                                                                                children,
                                                                            }) => {
    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={headerSection}>
                        <Img
                            src={companyLogo}
                            width="150"
                            height="50"
                            alt={`${companyName} logo`}
                            style={logo}
                        />
                        <Heading as="h1" style={heading}>
                            {companyName}
                        </Heading>
                        <Text style={subheading}>
                            <a href={companyWebsite} style={link}>
                                {companyWebsite}
                            </a>
                        </Text>
                    </Section>
                    <Hr style={hr} />
                    <Section style={contentSection}>
                        <div style={contentWrapper}>
                            {children}
                        </div>
                    </Section>
                    <Hr style={hr} />
                    <Section style={footerSection}>
                        <Text style={footer}>
                            © {new Date().getFullYear()} {companyName}. All rights reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
    maxWidth: '100%',
};

const headerSection = {
    display: 'flex',
    flexDirection: 'row' as const, // Or 'row' for horizontal alignment
    alignItems: 'center', // Center items horizontally
    justifyContent: 'center', // Center items vertically
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '5px 5px 0 0',
    textAlign: 'center' as const,
};

const contentSection = {
    padding: '48px 32px', // Increased vertical padding
    backgroundColor: '#ffffff',
};

const footerSection = {
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '0 0 5px 5px',
    textAlign: 'center' as const,
};

const logo = {
    margin: '0 auto',
};

const heading = {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '400',
    color: '#484848',
    padding: '17px 0 0',
};

const subheading = {
    fontSize: '15px',
    fontWeight: '400',
    color: '#687484',
};

const link = {
    color: '#687484',
    textDecoration: 'underline',
};

const hr = {
    borderColor: '#cccccc',
    margin: '0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
};

const contentWrapper = {
    padding: '0 16px', // Add horizontal padding to the content
};

export default FlexibleEmailTemplate;

