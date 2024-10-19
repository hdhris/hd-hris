import React from 'react';
import {Spinner} from "@nextui-org/react";
import Text from "@/components/Text";

function Loading() {
    return (
        <div className='w-full h-full grid place-items-center'>
            <div className='flex flex-col gap-4 items-center'>
                <Spinner/>
                <Text>Loading...</Text>
            </div>

        </div>
    );
}

export default Loading;