import React from 'react';
import {cn} from "@/lib/utils";
import Typography, {Heading} from "@/components/common/typography/Typography";

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
    return (<article className={cn("bg-white rounded border border-gray-200 dark:bg-gray-800 p-5", className, classNames?.container)}>
            <div className='flex justify-between'>
                {startContent && startContent}
                <span className="w-full">
                    <Heading className={classNames?.heading}>{heading}</Heading>
                    <Typography className={cn('text-sm opacity-75', classNames?.subHeading)}>{subHeading}</Typography>
                </span>
                {endContent && endContent}
            </div>
            {children}
        </article>);
}

export default BorderCard;