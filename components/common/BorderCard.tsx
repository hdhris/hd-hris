import React from 'react';
import {cn} from "@/lib/utils";
import Text from "@/components/common/typography/Text";

interface BorderCardProps {
    children: React.ReactNode,
    className?: string,
    heading: React.ReactNode,
    subHeading?: React.ReactNode,
    endContent?: React.ReactNode
    startContent?: React.ReactNode
    classNames?: {
        container?: string;
        heading?: string;
        subHeading?: string;
    }
}

function BorderCard({children, className, heading, subHeading, startContent, endContent, classNames}: BorderCardProps) {
    return (<article className={cn("bg-white rounded border border-gray-200 dark:bg-gray-800 p-4 md:p-6 drop-shadow", className, classNames?.container)}>
            <div className='flex justify-between'>
                {startContent && startContent}
                <span className="w-full">
                    <Text as='h1' className={cn('font-semibold ', classNames?.heading)}>{heading}</Text>
                    <Text className={cn('text-sm opacity-75', classNames?.subHeading)}>{subHeading}</Text>
                </span>
                {endContent && endContent}
            </div>
            {children}
        </article>);
}

export default BorderCard;