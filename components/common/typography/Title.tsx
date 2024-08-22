import React from 'react';
import {cn} from "@nextui-org/react";
import Text, {Heading} from "@/components/common/typography/Text";

type TitleProps = {
    children?: React.ReactNode;
   heading: string;
   subHeading: string;
   className?: string;
   classNames?: {
       base?: string;
       heading?: string;
       subHeading?: string;
   }
}

function Title({heading, subHeading, className, classNames, children}: TitleProps) {
    return (
        <div className={cn('flex justify-between items-center', className)}>
            <div className={cn(classNames?.base)}>
                <Heading as='h2' className={cn('text-medium', classNames?.heading)}>
                    {heading}
                </Heading>
                <Text className={cn('text-sm', classNames?.subHeading)}>
                    {subHeading}
                </Text>
            </div>

            <div>
            {children}
            </div>
        </div>
    );
}

export default Title;