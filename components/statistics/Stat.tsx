import React, {ReactNode} from "react";
import {cn} from "@/lib/utils";
import BorderCard from "@/components/common/BorderCard";
import {Divider} from "@nextui-org/divider";
import Text from "@/components/common/typography/Text";
import {Case, Switch} from "@/components/common/Switch";
import {IoTrendingDownOutline, IoTrendingUpOutline} from "react-icons/io5";
import {FaArrowTrendDown, FaArrowTrendUp} from "react-icons/fa6";


export interface StatProps {
    icon: React.ReactNode,
    value: React.ReactNode,
    title: string,
    status?: string,
    percent?: number
    footer: ReactNode | string
    chart?: React.ReactNode
}


export function Stat({data, className}: { data: StatProps[], className?: string }) {
    return (<>
        {data && data.map((item, index) => (<BorderCard key={index} heading=""
                                                        className={cn(`flex items-center`, className)}>
            <div className="flex flex-col">
                <div className="flex flex-col">
                    <Text as={'h2'}
                          className="text-lg font-semibold text-gray-400 dark:text-gray-500">{item.title}</Text>
                </div>
                <div className="flex justify-between items-center">
                    <Text as={'h1'}
                          className="text-3xl font-bold text-gray-600 dark:text-gray-500">{item.value}</Text>

                    {item.status && item.percent && <div>
                        <Switch expression={item.status}>
                            <Case of="increased">
                                <FaArrowTrendUp className="text-[#00C49F]"/>
                            </Case>
                            <Case of="decreased">
                                <FaArrowTrendDown className="text-[#FE5B6E]"/>
                            </Case>
                        </Switch>
                        <Text className="text-medium text-gray-400 dark:text-gray-500">
                            {item.percent}%</Text>
                    </div>}

                </div>

                <Divider className='w-36 my-2'/>
                {item.footer}
            </div>
            {/*<div className="flex-grow"></div>*/}

            <div className="w-fit h-fit self-start">
                {item.chart && item.chart}
            </div>
        </BorderCard>))}
    </>);
}
