import React from 'react';
import {Metadata} from "next";
import BorderCard from "@/components/common/BorderCard";
import {Avatar} from "@nextui-org/avatar";
import ProfileForm from "@/components/admin/defaults/profile/ProfileForm";


export const metadata: Metadata = {
    title: 'Account Settings',
}

function Page() {
    return (
        <section className='flex justify-center w-full h-full'>
            <BorderCard className='p-4 w-1/2 overflow-y-hidden' heading='Account Settings'>
                <div className='py-3 h-full'>
                   <ProfileForm/>
                </div>
            </BorderCard>
        </section>
    );
}

export default Page;