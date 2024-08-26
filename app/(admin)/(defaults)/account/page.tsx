
import React from 'react';
import {Heading} from "@/components/common/typography/Typography";
import ProfileForm from "@/components/admin/defaults/profile/ProfileForm";
import AccountSecurity from "@/components/admin/defaults/profile/AccountSecurity";


const AccountSettings: React.FC = () => (<div className='space-y-4 pr-4'>
    <div className='ms-5 space-y-5 h-[550px]'>
        <ProfileForm/>
    </div>
</div>);


function Page() {
    return (<section className='h-full flex flex-col gap-4'>
        <Heading as='h1' className='text-3xl font-bold'>Account Settings</Heading>
        <div className='grid grid-cols-2 gap-4 w-full overflow-hidden'>
            <AccountSettings/>
            <div className='pl-4 space-y-4'>
                <AccountSecurity/>
            </div>
        </div>
    </section>);
}

export default Page;
