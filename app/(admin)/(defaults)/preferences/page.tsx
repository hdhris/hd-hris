import React from 'react';
import {Heading, Section} from "@/components/common/typography/Typography";
import ProfileForm from "@/components/admin/defaults/profile/ProfileForm";
import AccountSecurity from "@/components/admin/defaults/profile/AccountSecurity";
import {Divider} from "@nextui-org/divider";
import NotificationSettings from "@/components/admin/defaults/profile/NotificationSettings";


const AccountSettings: React.FC = () => (<div className='space-y-4 pr-4'>
    <Section title='Account Settings' subtitle='Customize your account details.'/>
    <div className='ms-10 space-y-5'>
        <ProfileForm/>
    </div>
</div>);


function Page() {
    return (<section className='h-full flex flex-col gap-4'>
        <Heading as='h1' className='text-3xl font-bold'>Preferences</Heading>
        {/*<div className='grid grid-cols-2 gap-4 w-full overflow-hidden'>*/}

        {/*    <div className='pl-4 space-y-4'>*/}
        {/*        <AccountSettings/>*/}
        {/*        <Divider/>*/}
        {/*        <div>*/}
        {/*            <AccountSecurity/>*/}
        {/*        </div>*/}
        {/*        /!*<AccountControl/>*!/*/}
        {/*    </div>*/}
        {/*    <NotificationSettings/>*/}
        {/*</div>*/}
        <div className='grid grid-cols-2 gap-4 w-full overflow-hidden'>
            <div className="space-y-2">
                <AccountSettings/>
                <Divider/>
                <NotificationSettings/>
            </div>

            <div className='pl-4 space-y-4'>
                <AccountSecurity/>
            </div>
        </div>
    </section>);
}

export default Page;
