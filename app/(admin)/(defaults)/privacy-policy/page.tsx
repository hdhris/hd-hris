"use client"
import React from 'react';
import Typography, {Heading} from "@/components/common/typography/Typography";
import {Chip, cn} from '@nextui-org/react';

const heading = 'text-medium font-semibold'
const text = 'text-base'
const ColumnOne: React.FC = () => (<div className='space-y-4 pr-4 text-justify'>
        <Typography className={text}>
            Welcome to our Human Resource Information System (HRIS) web and mobile apps! We are committed to protecting
            your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.
        </Typography>
        <ol className='list-decimal ms-5 pb-8 pl-4 space-y-2'>
            <li className='space-y-2'>
                <Typography className={heading}>Information Collection</Typography>
                <Typography className={cn('indent-5', text)}>
                    <b>What Information We Collect:</b> We collect personal details (name, employee ID, contact info,
                    job title, etc.), work information (employment history, performance reviews, attendance records,
                    etc.), and system usage data (login times, device details, etc.).
                </Typography>
                <Typography className={cn('indent-5', text)}>
                    <b>How We Collect Information:</b> Information is collected directly from you, automatically through
                    system logs and cookies, and from integrated third-party services.
                </Typography>
            </li>
            <li className='space-y-2'>
                <Typography className={heading}>How We Use Your Information</Typography>
                <Typography className={cn('indent-5', text)}>
                    We use your information to manage HR tasks, improve the system, and meet legal obligations.
                </Typography>
            </li>
            <li className='space-y-2'>
                <Typography className={heading}>Sharing and Disclosing Information</Typography>
                <Typography className={cn('indent-5', text)}>
                    We do not share your personal information with outside parties unless you agree, it&apos;s required
                    by
                    law, or we are working with trusted service providers who help operate the HRIS.
                </Typography>
            </li>
            <li className='space-y-2'>
                <Typography className={heading}>Your Rights</Typography>
                <Typography className={cn('indent-5', text)}>
                    You have the right to access, correct, delete, or request a copy of your information. You can also
                    control cookie usage through your browser or device settings.
                </Typography>
            </li>
            <li className='space-y-2'>
                <Typography className={heading}>Cookie Policy</Typography>
                <Typography className={cn('indent-5', text)}>
                    We use cookies to keep you logged in, understand how the HRIS is used, and remember your
                    preferences.
                </Typography>
            </li>
            <li className='space-y-2'>
                <Typography className={heading}>How We Protect Your Data</Typography>
                <Typography className={cn('indent-5', text)}>
                    We implement encryption, restrict access, and conduct regular security checks to protect your data.
                </Typography>
            </li>
            <li className='space-y-2'>
                <Typography className={heading}>Changes to This Privacy Policy</Typography>
                <Typography className={cn('indent-5', text)}>
                    We may update this Privacy Policy. Any significant changes will be communicated via email or within
                    the HRIS, and the latest version will be available on our website.
                </Typography>
            </li>
            <li className='space-y-2'>
                <Typography className={heading}>Contact Us</Typography>
                <Typography className={cn('indent-5', text)}>
                    For any questions or concerns about this Privacy Policy or your data, please contact us at:
                </Typography>
                <Typography className={cn('indent-5', text)}>
                    <b>Email:</b> [Insert Contact Email]
                </Typography>
                <Typography className={cn('indent-5', text)}>
                    <b>Phone:</b> [Insert Contact Number]
                </Typography>
                <Typography className={cn('indent-5', text)}>
                    <b>Address:</b> [Insert Company Address]
                </Typography>
            </li>
        </ol>
    </div>);

function Page() {
    return (<section className='h-full flex flex-col gap-4'>
        <div className="flex flex-row justify-between items-center">
            <div>
                <Heading as='h1' className='text-3xl font-bold'>Privacy Policy</Heading>
                <Heading as='h2' className='text-lg font-bold'>Effective Date: August 10, 2024</Heading>
            </div>
            <Chip>You agreed to the terms and conditions on August 12, 2020 12:00 GMT +08.</Chip>
        </div>
        <ColumnOne/>
    </section>);
}

export default Page;
