import React from 'react';
import Text from "@/components/Text";
import Image from 'next/image'
import logo from "@/public/logo.svg"

function SystemLoading() {
    return (
        <div className='w-full h-full grid place-items-center'>
            <div className='flex flex-col gap-4 items-center'>
                <Image src={logo} className="size-48" alt="system logo"/>
                <Text>{process.env.APP_NAME}</Text>
            </div>

        </div>
    );
}

export default SystemLoading;