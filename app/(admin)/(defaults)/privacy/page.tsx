'use client'
import React from 'react';
import {Heading, Section} from "@/components/common/typography/Typography";
import {Button} from "@nextui-org/button";
import {Link} from '@nextui-org/react';
import PrivacyPolicyForm from "@/components/admin/defaults/privacy/PrivacyPolicyForm";


const ColumnOne: React.FC = () => (<div className='space-y-4 pr-4'>
    <Section title='Privacy Policy Management'
             subtitle='Manage and update the organization’s privacy policy.'/>
    <div className='ms-16 space-y-5'>
        <PrivacyPolicyForm/>
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
        <Heading as='h1' className='text-3xl font-bold'>Privacy</Heading>
        <div className='grid grid-cols-2 gap-4 w-full h-4/5'>
            <ColumnOne/>
            <ColumnTwo/>
        </div>
    </section>);
}

export default Page;
