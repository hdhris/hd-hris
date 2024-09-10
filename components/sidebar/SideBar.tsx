'use client'
import React, {ReactNode, useEffect, useMemo, useState} from "react";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import Typography from "@/components/common/typography/Typography";
import dayjs from "dayjs";
import {LuCalendarClock} from "react-icons/lu";
import {icon_size} from "@/lib/utils";
import {cn} from '@nextui-org/react'
import {Divider} from "@nextui-org/divider";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import DateComponent from "@/components/date/DateComponent";

dayjs.extend(customParseFormat);



export default function SideBar({children, className, onClockShow}: {
    children: ReactNode,
    className?: string,
    onClockShow?: boolean
}) {
    return (
        <aside
            className={cn("flex justify-between flex-col py-5 w-48 h-screen bg-white border-r border-gray-200", className)}
        ><ScrollShadow hideScrollBar className="px-3 pb-4 bg-white dark:bg-gray-800">
            <ul className="space-y-2">
                {children}
            </ul>
        </ScrollShadow>
            <DateComponent onClockShow={onClockShow}/>
        </aside>
    );
}