'use client'
import React from 'react';
import Typography, {Heading, Section} from "@/components/common/typography/Typography";
import {Button} from "@nextui-org/button";
import {Divider} from "@nextui-org/divider";
import {Chip, cn, Switch} from '@nextui-org/react';
import SelectionMenu from "@/components/dropdown/SelectionMenu";


const languages = [{uid: 'en', name: 'English'}]
const regions = [{uid: 'ph', name: 'Philippines'}]
const timezones = [{uid: 'cst', name: 'CST • GMT +08'}]
const text_size = [{uid: 'sm', name: 'Small'}, {uid: 'md', name: 'Medium'}, {uid: 'lg', name: 'Large'}]

const heading = 'text-medium font-semibold'
const text = 'text-base'
const ColumnOne: React.FC = () => (<div className='space-y-4 pr-4 text-justify'>
    <Typography className={text}>
        Welcome to <b>HD-HRIS!</b> By accessing and using our Human Resource Information System (HRIS), you agree to be
        bound by the following Terms and Conditions. Please read them carefully.
    </Typography>
    <ol className='list-decimal ms-5 pb-8 pl-4 space-y-2'>
        <li className='space-y-2'>
            <Typography className={heading}>Acceptance of Terms</Typography>
            <Typography className={cn('indent-5', text)}>
                By using our HRIS, you acknowledge that you have read, understood, and agree to these Terms and
                Conditions. If you do not agree to these terms, please do not use the system.
            </Typography>
        </li>
        <li className='space-y-2'>
            <Typography className={heading}>User Obligations</Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Account Security:</b> You are responsible for maintaining the confidentiality of your account
                credentials and for all activities that occur under your account.
            </Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Prohibited Use:</b> You agree not to use the HRIS for any unlawful purposes or in a manner that
                could damage, disable, overburden, or impair the system.
            </Typography>
        </li>
        <li className='space-y-2'>
            <Typography className={heading}>Account Management</Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Account Creation:</b> You are responsible for all activities conducted through your account and
                for updating your information as necessary.
            </Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Account Responsibility:</b> You agree not to use the HRIS for any unlawful purposes or in a
                manner that could damage, disable, overburden, or impair the system.
            </Typography>
        </li>
        <li className='space-y-2'>
            <Typography className={heading}>Privacy and Data Protection</Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Data Collection:</b> We collect and use personal data in accordance with our Privacy Policy.
            </Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Data Security:</b> We implement reasonable security measures to protect your data. However, we
                cannot guarantee absolute security.
            </Typography>
        </li>
        <li className='space-y-2'>
            <Typography className={heading}>Intellectual Property</Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Ownership:</b> All content, features, and functionality of the HRIS are the exclusive property of
                Home Design and are protected by intellectual property laws.
            </Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Usage Restrictions:</b> You may not copy, modify, or distribute any part of the HRIS without our
                express permission.
            </Typography>
        </li>
        <li className='space-y-2'>
            <Typography className={heading}>Service Availability</Typography>
            <Typography className={cn('indent-5', text)}>
                <b>System Access:</b> We strive to keep the HRIS available and operational but do not guarantee
                uninterrupted access.
            </Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Maintenance:</b> We may perform maintenance and updates, which could affect system availability.
            </Typography>
        </li>
        <li className='space-y-2'>
            <Typography className={heading}>Limitation of Liability</Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Disclaimer:</b> The HRIS is provided &quot;as is&quot; without warranties of any kind. We are not
                liable
                for any direct, indirect, incidental, or consequential damages arising from the use or inability to
                use the HRIS.
            </Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Data Loss:</b> We are not responsible for any loss of data or interruptions in service.
            </Typography>
        </li>
        <li className='space-y-2'>
            <Typography className={heading}>Indemnification</Typography>
            <Typography className={cn('indent-5', text)}>
                You agree to indemnify and hold harmless [Your Company] from any claims, damages, liabilities, and
                expenses arising from your use of the HRIS or violation of these Terms and Conditions.
            </Typography>
        </li>
        <li className='space-y-2'>
            <Typography className={heading}>Changes to Terms</Typography>
            <Typography className={cn('indent-5', text)}>
                We may update these Terms and Conditions from time to time. We will notify you of significant
                changes by posting the updated terms on our HRIS. Your continued use of the HRIS constitutes
                acceptance of the new terms.
            </Typography>
        </li>
        <li className='space-y-2'>
            <Typography className={heading}>Governing Law</Typography>
            <Typography className={cn('indent-5', text)}>
                These Terms and Conditions are governed by and construed in accordance with the laws of the
                Philippines. Any disputes arising under these terms will be resolved in the courts of the
                Philippines.
            </Typography>
        </li>
        <li className='space-y-2'>
            <Typography className={heading}>Contact Information</Typography>
            <Typography className={cn('indent-5', text)}>
                For any questions or concerns about these Terms and Conditions, please contact us at:
            </Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Email:</b> [Support Email]
            </Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Phone:</b> [Support Phone Number]
            </Typography>
            <Typography className={cn('indent-5', text)}>
                <b>Address:</b> [Company Address]
            </Typography>
        </li>
        <li className='space-y-2'>
            <Typography className={heading}>Acknowledgment</Typography>
            <Typography className={cn('indent-5', text)}>
                By using our HRIS, you acknowledge that you have read and agree to these Terms and Conditions.
            </Typography>
        </li>
    </ol>

</div>);

const ColumnTwo: React.FC = () => (<div className='pl-4 space-y-4'>
    <Section title='Accessibility Options'
             subtitle='Offers features to improve accessibility for users with disabilities or special needs.'/>
    <div className='ms-5 space-y-5'>
        <Section title='Text Size Adjustment' subtitle="Adjust the text size for better readability.">
            <SelectionMenu placeholder='Medium' options={text_size} isRequired={false}/>
        </Section>
        <Divider/>
    </div>
    <Section title='Notification Settings' subtitle='Customize your notification preferences.'/>
    <div className='ms-5 space-y-5'>
        <Section title='Allow Email Notification'
                 subtitle="Opt in to receive notifications via email for updates and alerts.">
            <Switch defaultSelected size='sm' color="primary"/>
        </Section>
        <Section title='Allow Push Notifications' subtitle='Enable push notifications to receive alerts.'>
            <Switch defaultSelected size='sm' color="primary"/>
        </Section>
        <Section title='Do Not Disturb'
                 subtitle='Turn on Do Not Disturb to silence notifications during specific times or periods.'>
            <Switch defaultSelected size='sm' color="primary"/>
        </Section>
        <Section title='Notification Sound' subtitle='Choose a sound for your notifications.'>
            <Button size='sm' variant='faded'>Configure</Button>
        </Section>
    </div>
</div>);

function Page() {
    return (<section className='h-full flex flex-col gap-4'>
        <div className="flex flex-row justify-between items-center">
            <div>
                <Heading as='h1' className='text-3xl font-bold'>Terms and Conditions</Heading>
                <Heading as='h2' className='text-lg font-bold'>Effective Date: August 10, 2024</Heading>
            </div>
            <Chip>You agreed to the terms and conditions on August 12, 2020 12:00 GMT +08.</Chip>
        </div>
        <ColumnOne/>
    </section>);
}

export default Page;
