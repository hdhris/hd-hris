'use client'
import React from 'react';
import Text, {Heading, Section} from "@/components/common/typography/Typography";
import {Button} from "@nextui-org/button";
import {Divider} from "@nextui-org/divider";
import {Accordion, AccordionItem, cn, Link} from '@nextui-org/react';
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {LuMapPin, LuPhoneCall} from "react-icons/lu";
import {MdAlternateEmail} from "react-icons/md";
import {FaFacebookMessenger} from "react-icons/fa6";
import {icon_color, icon_size} from "@/lib/utils";

const backupFrequencyOptions = [{uid: '1', name: 'Daily'}, {uid: '2', name: 'Weekly'}, {
    uid: '3', name: 'Monthly'
}, {uid: '4', name: 'Yearly'},];

const backupSelectionOptions = [{uid: '1', name: 'All'}, {uid: '2', name: 'Employee'}, {
    uid: '3', name: 'Attendance'
}, {uid: '4', name: 'Salary'},];


const ColumnOne: React.FC = () => (<div className='space-y-4 pr-4'>
    <Section title='Knowledge Base or FAQ'
             subtitle='Find answers to common questions and troubleshooting tips in the Knowledge Base or FAQ section.'/>
    <div className='ms-16 space-y-5 h-[250px] overflow-hidden'>
        <ScrollShadow className="h-full pr-4" size={10}>
            <Accordion variant="light">
                <AccordionItem classNames={{
                    title: 'text-medium'
                }} key="1" aria-label="Accordion 1" title="What is a payroll management system?">
                    <Text className='text-base'>• A payroll management system automates the process of paying employees,
                        managing taxes, and handling deductions.</Text>
                </AccordionItem>
                <AccordionItem classNames={{
                    title: 'text-medium'
                }} key="2" aria-label="Accordion 2" title="How do I sign up for an account?">
                    <Text className='text-base'>
                        • To register an account, the process is restricted to HR managers only. When adding an employee account, credentials are sent directly to the employee&apos;s email address. The HR manager initiates the registration by entering the employee&apos;s details and then the employee receives an email with instructions to set their credentials and complete the account setup. This ensures secure and personalized access for each employee.
                    </Text>
                </AccordionItem>
                <AccordionItem classNames={{
                    title: 'text-medium'
                }} key="3" aria-label="Accordion 3" title="What are the key features of the HRiS?">
                    <Text className='text-base'>• Our system includes features such as automated payroll processing, tax
                        calculations, direct deposit, and customizable reporting.</Text>

                </AccordionItem>
            </Accordion>
        </ScrollShadow>

    </div>
    <Divider/>
    <Section title='Contact Information' subtitle='Find details to contact support or customer service.'/>
    <div className='ms-16 space-y-5'>
        <div className='flex gap-2'>
            <LuPhoneCall className={cn(icon_size, icon_color)}/>
            <Text className='text-base'>123-456-7890</Text>
        </div>
        <div className='flex gap-2'>
            <MdAlternateEmail className={cn(icon_size, icon_color)}/>
            <Link href='mailto:6fF0a@example.com' className='underline text-base'>6fF0a@example.com</Link>
        </div>
        <div className='flex gap-2'>
            <FaFacebookMessenger className={cn(icon_size, icon_color)}/>
            <Link href='https://www.messenger.com/' target='_blank' className='underline text-base'>HRiS</Link>
        </div>

        <div className='flex gap-2'>
            <LuMapPin className={cn(icon_size, icon_color)}/>
            <Link href="https://www.google.com/maps/place/123+Main+Street,+Anytown,+USA+12345"
                  target="_blank"
                  rel="noopener noreferrer" className='underline text-base'>123 Main Street, Anytown, USA 12345</Link>
        </div>


    </div>
</div>);

const ColumnTwo: React.FC = () => (<div className='pl-4 space-y-4'>
    <Section title='Video Tutorials or Guides'
             subtitle='Watch video tutorials or download guides for step-by-step instructions and helpful tips.'/>
    <div className='ms-5 space-y-5'>
        <div className='flex flex-col gap-2'>
            <Section title='Getting Started with HD-HRIS - YouTube' subtitle=''/>
            <iframe className='ms-16 mb-5' width="512" height="312" src="https://www.youtube.com/embed/ZVnjOPwW4ZA"
                    title="Next js Tutorial for Beginners | Nextjs 13 (App Router) with TypeScript" frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        </div>

        <Section title='HD-HRIS User Manual' subtitle='Download the HD-HRIS User Manual in PDF format.'>
            <Button size='sm' variant='faded' as={Link} href={'/user-manual.pdf'} target='_blank'>Download</Button>
        </Section>


    </div>
</div>);

function Page() {
    return (<section className='h-full flex flex-col gap-4'>
        <Heading as='h1' className='text-3xl font-bold'>Help and Support</Heading>
        <div className='grid grid-cols-2 gap-4 w-full h-4/5'>
            <ColumnOne/>
            <ColumnTwo/>
        </div>
    </section>);
}

export default Page;
