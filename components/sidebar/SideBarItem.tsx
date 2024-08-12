"use client"
import Link from "next/link";
import Text from "@/components/common/typography/Text";
import React, { ReactNode, useEffect, useState } from "react";
import {cn} from "@nextui-org/react";

interface SidebarItem {
    label: string;
    href: string;
    icon?: ReactNode;
}


export default function SideBarItem({ label, href, icon }: SidebarItem) {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsActive(window.location.pathname === href);
        }
    }, [href]);
    return (
        <li>
            <Link href={href}
                  className={cn("flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-primary/25 hover:rounded dark:hover:bg-slate-200 group", isActive && 'font-semibold bg-primary rounded')}>
                {icon && (
                    <span
                        className={cn("text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white", isActive && 'text-white font-semibold')}>
          {icon}
        </span>
                )}
                <Text className={cn("ms-3 text-sm group-hover:text-primary" , isActive && 'text-white')}>{label}</Text>
            </Link>
        </li>
    );
}
