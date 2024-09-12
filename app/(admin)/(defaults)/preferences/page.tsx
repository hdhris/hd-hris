import React from 'react';
import {Heading, Section} from "@/components/common/typography/Typography";
import ProfileForm from "@/components/admin/defaults/profile/ProfileForm";
import AccountSecurity from "@/components/admin/defaults/profile/AccountSecurity";
import {Divider} from "@nextui-org/divider";
import {Switch} from "@nextui-org/react";
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import NotificationSettings from "@/components/admin/defaults/profile/NotificationSettings";
import {ScrollShadow} from "@nextui-org/scroll-shadow";


const AccountSettings: React.FC = () => (<div className='space-y-4 pr-4'>
    <Section title='Account Settings' subtitle='Customize your account details.'/>
    <div className='ms-10 space-y-5 h-[500px]'>
        <ProfileForm/>
    </div>
</div>);



function Page() {
    return (<section className='h-full flex flex-col gap-4'>
        <Heading as='h1' className='text-3xl font-bold'>Preferences</Heading>
        <div className='grid grid-cols-2 gap-4 w-full overflow-hidden'>
            <AccountSettings/>
            <div className='pl-4 space-y-4'>
                <AccountSecurity/>
                <Divider/>
                <div>
                    <NotificationSettings/>
                </div>
                {/*<AccountControl/>*/}
            </div>
        </div>
    </section>);
}

export default Page;
