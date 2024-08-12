import React, {ReactNode} from "react";
import {cn} from "@/lib/utils";
import {Avatar} from "@nextui-org/avatar";
import BorderCard from "@/components/common/BorderCard";
import {Divider} from "@nextui-org/divider";


export interface StatProps {
    icon: React.ReactNode,
    value: React.ReactNode,
    title: string,
    status?: string,
    percent?: number
    chart?: React.ReactNode
}


export function Stat({data, className}: { data: StatProps[], className?: string }) {
    return (
        <>
            {
                data && data.map((item, index) => (
                        <BorderCard key={index} heading=""
                                    className={cn(`flex items-center`, className)}>
                            <div className="flex flex-col">
                                <div className="flex gap-4 ">
                                    <Avatar icon={item.icon}
                                        // style={{color: "rgb(107 114 128)"}}
                                            color='default'
                                    />
                                    <div className="flex flex-col">
                                        <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-500">{item.value}</h1>
                                        <h2 className="text-2xs text-gray-400 dark:text-gray-500">{item.title}</h2>
                                    </div>
                                </div>
                                <Divider className='w-36 my-2'/>

                                {item.status && item.percent &&
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        <span>{item.status}</span>{item.percent}% last month</p>
                                }

                            </div>
                            <div className="flex-grow"></div>

                            <div className="w-fit h-fit self-start">
                                {item.chart && item.chart}
                            </div>
                        </BorderCard>
                    )
                )
            }
        </>
    );
}
