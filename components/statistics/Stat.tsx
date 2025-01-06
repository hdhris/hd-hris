import React, {ReactNode} from "react";
import {cn} from "@nextui-org/react";
import BorderCard from "@/components/common/BorderCard";
import {Divider} from "@nextui-org/divider";
import Typography from "@/components/common/typography/Typography";
import {Case, Default, Switch} from "@/components/common/Switch";
import {FaArrowTrendDown, FaArrowTrendUp} from "react-icons/fa6";
import {LuMinus} from "react-icons/lu";


export interface StatProps {
    icon: React.ReactNode,
    value: React.ReactNode,
    title: string,
    status?: "increment" | "decrement" | "no change",
    percent?: string
    footer?: ReactNode | string
    chart?: React.ReactNode
}


export function Stat({data, className}: { data: StatProps[], className?: string }) {
    return (<>
        {data && data.map((item, index) => (<BorderCard key={index} heading=""
                                                        className={cn(`flex items-center`, className)}>
            <div className="flex flex-col w-full">
                <div className="flex flex-col w-full">
                    <Typography as={'h2'}
                                className="text-lg font-semibold text-gray-400 dark:text-gray-500">{item.title}</Typography>
                </div>
                <div className="flex justify-between items-center w-fit gap-5">
                    <Typography as={'h1'}
                                className="text-3xl font-bold text-gray-600 dark:text-gray-500">{item.value}</Typography>

                    {item.status && item.percent && <div className="flex gap-2 items-center">
                        <Switch expression={item.status}>
                            <Case of="increment">
                                <FaArrowTrendUp className="text-[#00C49F]"/>
                            </Case>
                            <Case of="decrement">
                                <FaArrowTrendDown className="text-[#FE5B6E]"/>
                            </Case>
                            <Default>
                                <LuMinus className="text-[#fecb5b] stroke-2"/>
                            </Default>
                        </Switch>
                        <Typography className="text-medium text-gray-400 dark:text-gray-500">
                            {item.percent}%</Typography>
                    </div>}

                </div>

                <Divider className='w-48 my-2'/>
                {item.footer && <div className="w-fit text-default-400">
                    {item.footer}
                </div>}
            </div>
            {/*<div className="flex-grow"></div>*/}

            <div className="w-fit h-full">
                <div className="flex justify-end">
                    {item.chart && item.chart}
                </div>
            </div>
        </BorderCard>))}
    </>);
}
