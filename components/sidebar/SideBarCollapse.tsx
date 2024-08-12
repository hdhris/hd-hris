'use client'

import {FiChevronDown, FiChevronLeft} from "react-icons/fi";
import Text from "@/components/common/typography/Text";
import React, {ReactNode, useState} from "react";
import {cn} from "@/lib/utils";
import Link from "next/link";
import {Button} from "@nextui-org/button";
import {Case, Default, Switch} from "@/components/common/Switch";

interface SideBarCollapseProps {
    children: ReactNode
    label: string
    icon?: ReactNode
    href?: string
}

export default function SideBarCollapse({children, icon, label, href}: SideBarCollapseProps) {
    const [toggle, setToggle] = useState(false);
    const handleToggle = () => setToggle(!toggle)
    return (
        <>

            <Button
                variant="light"
                onClick={handleToggle}
                className="group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-300 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
                {icon && (<span
                    className={cn("text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white", toggle && 'text-gray-900')}>
          {icon}
        </span>)}
                <Switch expression={href!}>
                    <Case of={href != null}>
                        <Link href={href!} className='w-full'>
                            <Text
                                className={cn("flex-1 ml-1 text-left text-sm rtl:text-right whitespace-nowrap", toggle && 'font-semibold text-slate-800')}>
                                {label}
                            </Text>
                        </Link>
                    </Case>
                    <Default>
                        <Text
                            className={cn("flex-1 ml-1 text-left text-sm rtl:text-right whitespace-nowrap", toggle && 'font-semibold text-slate-800')}>
                            {label}
                        </Text>
                    </Default>
                </Switch>

                {toggle ? <FiChevronDown/> : <FiChevronLeft className='stroke-gray-500'/>}
            </Button>
            {toggle && (<ul className="py-2 space-y-2">{children}</ul>)}
        </>
    )
}