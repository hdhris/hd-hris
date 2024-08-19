
import React from 'react';
import Text from '@/components/Text';
import Link from "next/link";

function Update() {
    return (
        <div className="h-fit w-full fixed top-0 z-50 bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10">
            <Text className="text-center text-tiny text-primary"> New Update:
                I&apos;m currently working on integrating an <q className="italic font-semibold">{process.env.UPDATE_NAME}</q> module. <Link href={process.env.UPDATE_LINK as string}><span className="text-blue-400 underline">Click Here</span></Link></Text>

        </div>
    );
}

export default Update;