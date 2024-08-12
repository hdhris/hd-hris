'use client'
import React, { ReactNode, useState, useEffect, useMemo } from "react";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import Text from "@/components/common/typography/Text";
import dayjs from "dayjs";
import {LuCalendar, LuCalendarClock, LuTimer} from "react-icons/lu";
import { cn, icon_size } from "@/lib/utils";
import {Divider} from "@nextui-org/divider";
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

function DateComponent() {
    const [date, setDate] = useState<string[]>(["--", "--", "--", "--:--", "--", "--"]);

    useEffect(() => {
        const updateDate = () => setDate(dayjs().format("DD MMM YYYY ddd h:mm A").split(" "));
        updateDate(); // Set initial date
        const interval = setInterval(updateDate, 1000); // Update every second

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);
    return useMemo(() => (
        <div className='flex flex-col gap-3 p-2 mb-20 ml-2'>
            <div className="flex flex-row gap-2 items-center">
                <Text className="text-6xl font-semibold text-inactive-bar">{date[0]}</Text>
                <div className="flex flex-col">
                    <Text className="text-xl font-semibold text-inactive-bar">{date[1]}</Text>
                    <Text className="text-lg font-semibold opacity-50 text-inactive-bar">{date[2]}</Text>

                </div>
            </div>
            <Divider/>
            <div className="flex gap-2 items-center">
                <LuCalendarClock className={cn("text-inactive-bar", icon_size)} />
                <Text className="text-inactive-bar">{date[3]}</Text>
                <Divider orientation="vertical"/>
                {/*<LuTimer className={cn("text-white", icon_size)} />*/}
                <Text className="text-inactive-bar">{date[4] + " " + date[5]}</Text>
            </div>
        </div>
    ), [date]);
}

export default function SideBar({ children }: { children: ReactNode }) {
    return (
        <aside
            className="flex justify-between flex-col py-5  w-48 h-screen transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
        ><ScrollShadow hideScrollBar className="px-3 pb-4 bg-white dark:bg-gray-800">
            <ul className="space-y-2">
                {children}
            </ul>
        </ScrollShadow>
            <DateComponent/>
        </aside>
    );
}

