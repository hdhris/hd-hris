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
import RenderList from "@/components/util/RenderList"

const ColumnOne: React.FC = () => (<div className='space-y-4 pr-4'>
    <Section title='Login Activity'
             subtitle='Shows recent login attempts and account access activities.'/>
    <div className='ms-16 space-y-5 h-[250px] overflow-hidden'>
        <ScrollShadow className="h-full pr-4" size={10}>
            {/*<RenderList items={} map={}/>*/}
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
        <Heading as='h1' className='text-3xl font-bold'>Security</Heading>
        <div className='grid grid-cols-2 gap-4 w-full h-4/5'>
            <ColumnOne/>
            <ColumnTwo/>
        </div>
    </section>);
}

export default Page;
