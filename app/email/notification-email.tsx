import {Body, Column, Container, Head, Hr, Html, Img, Section, Tailwind, Text,} from '@react-email/components';
import * as React from 'react';

interface FlexibleEmailTemplateProps {
    companyName?: string;
    companyLogo?: string;
    companyWebsite?: string;
    children: React.ReactNode;
}

export const FlexibleEmailTemplate: React.FC<FlexibleEmailTemplateProps> = ({
                                                                                companyName = process.env.COMPANY_NAME,
                                                                                companyLogo = process.env.COMPANY_LOGO + "/logo.svg",
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
                                <Img
                                    src={companyLogo}
                                    className="size-24"
                                    alt={`${companyName} logo`}
                                    style={logo}
                                />
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

