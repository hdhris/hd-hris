import {Body, Column, Container, Head, Hr, Html, Img, Link, Section, Tailwind, Text,} from '@react-email/components';
import * as React from 'react';

interface FlexibleEmailTemplateProps {
    companyName?: string;
    companyWebsite?: string;
    children: React.ReactNode;
}

export const FlexibleEmailTemplate: React.FC<FlexibleEmailTemplateProps> = ({
                                                                                companyName = process.env.COMPANY_NAME,
                                                                                companyWebsite = process.env.COMPANY_WEBSITE,
                                                                                children,
                                                                            }) => {
    return (<Html>
            <Head/>
            <Body style={main}>
                <Tailwind>
                    <Container className="h-full w-full ">
                        <Section>
                            <Column className="px-4">
                                {/*<Img*/}
                                {/*    alt="Logo"*/}
                                {/*    className="mx-auto"*/}
                                {/*    height={250}*/}
                                {/*    src="https://hd-hris.vercel.app/logo.svg"*/}
                                {/*/>*/}
                                <img src="https://files.edgestore.dev/6bc0cgi3ynpz46db/publicFiles/_public/72b8b592-e919-4f88-af00-6966a6f1ca7c.jpg" alt="logo" className="mx-auto h-64"/>
                            </Column>

                        </Section>
                        <Hr style={hr}/>
                        <Section style={contentSection}>
                            <div className="px-4">
                                {children}
                            </div>
                            <div className="px-4">
                                <Text style={footerText}>
                                    Best regards,
                                    <br/>
                                    <strong>HD-HRiS</strong>
                                    <br/>
                                    <em>This is an automated message—please do not reply.</em>
                                </Text>
                            </div>

                        </Section>
                        <Hr style={hr}/>
                        <Section style={footerSection}>
                            <Text className="text-gray-800 mt-6">
                                {"If you have any questions or require further assistance, please feel free to reach out to us at "}
                                <Link href="mailto:support@example.com" className="text-blue-600 underline">
                                    support@example.com
                                </Link>.
                            </Text>
                            <div className="mt-4">
                                <Text style={footer}>
                                    © {new Date().getFullYear()} {companyName}. All rights reserved.

                                </Text>
                                <Text style={footer}>
                                    {companyName}
                                </Text>
                                <Text style={footer}>
                                    <a href={companyWebsite}>{companyWebsite}</a>
                                </Text>
                            </div>
                        </Section>
                    </Container>
                </Tailwind>
            </Body>
        </Html>);
};

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};


const contentSection = {
    padding: '48px 32px', // Increased vertical padding
    backgroundColor: '#ffffff',
};

const footerSection = {
    padding: '32px', backgroundColor: '#ffffff', borderRadius: '0 0 5px 5px', textAlign: 'center' as const,
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
    fontSize: '15px', fontWeight: '400', color: '#687484',
};

const link = {
    color: '#687484', textDecoration: 'underline',
};

const hr = {
    borderColor: '#cccccc', margin: '0',
};

const footer = {
    color: '#8898aa', fontSize: '12px', margin: 0, lineHeight: "20px"
};

const footerText = {
    color: "#777", fontSize: "14px", lineHeight: "1.5", marginTop: "20px",
}
export default FlexibleEmailTemplate;

