'use client'
import React, {ReactNode, useEffect, useMemo, useState} from "react";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import Text from "@/components/common/typography/Text";
import dayjs from "dayjs";
import {LuCalendarClock} from "react-icons/lu";
import {cn, icon_size} from "@/lib/utils";
import {Divider} from "@nextui-org/divider";
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface Props {
    onClockShow?: boolean
}
function DateComponent({ onClockShow }: Props) {
    const [date, setDate] = useState<string[]>([
        "--",
        "--",
        "--",
        "--:--",
        "--",
        "--",
    ]);

    useEffect(() => {
        const updateDate = () =>
            setDate(
                dayjs()
                    .format(`DD MMM YYYY ddd ${onClockShow ? "hh:mm A" : "HH:mm"}`)
                    .split(" ")
            );
        updateDate(); // Set initial date
        const interval = setInterval(updateDate, 1000); // Update every second

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [onClockShow]); // Remove `date` from dependencies

    return useMemo(
        () => (
            <>
                {onClockShow ? (
                    <div className="flex flex-col gap-3 p-2 mb-20 ml-2">
                        <div className="flex flex-row gap-2 items-center">
                            <Text className="text-6xl font-semibold">{date[0]}</Text>
                            <div className="flex flex-col">
                                <Text className="text-xl font-semibold">{date[1]}</Text>
                                <Text className="text-lg font-semibold opacity-50">
                                    {date[2]}
                                </Text>
                            </div>
                        </div>
                        <Divider />
                        <div className="flex gap-2 items-center">
                            <Text>{date[3]}</Text>
                            <Divider orientation="vertical" />
                            <Text className="text-inactive-bar">{`${date[4]} ${date[5]}`}</Text>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 p-2 mb-20">
                        <div className="flex flex-col gap-2 items-center">
                            <Text className="font-semibold text-2xl">
                                {date[4].split(":")[0]}
                            </Text>
                            <Text className="font-semibold text-2xl">
                                {date[4].split(":")[1]}
                            </Text>
                        </div>
                    </div>
                )}
            </>
        ),
        [date, onClockShow]
    );
}


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

