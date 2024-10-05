'use client'
import React from 'react';
import {Tab, Tabs} from "@nextui-org/react";
import {usePathname, useRouter} from "next/navigation";
import {ScrollShadow} from "@nextui-org/scroll-shadow";

export interface TabItem {
    key: string;
    title: string;
    path: string;
}

export interface NavigationTabsProps {
    tabs: TabItem[];
    basePath: string;
    children: React.ReactNode;
}

function NavigationTabs({tabs, basePath, children}: NavigationTabsProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Determine the active tab based on the current pathname
    const activeTab = tabs.find(tab => pathname.includes(tab.key))?.key || tabs[0].key;

    const handleTabChange = (key: string) => {
        router.push(`/${basePath}/${key}`);
    };

    return (
        <div className="flex flex-col space-y-4 h-full">
            <Tabs
                aria-label="Navigation Tabs"
                disableAnimation
                selectedKey={activeTab}
                onSelectionChange={(key) => handleTabChange(key as string)}
            >
                {tabs.map(tab => (
                    <Tab key={tab.key} title={tab.title}/>
                ))}
            </Tabs>
            <div className="h-full overflow-hidden">{children}</div>
        </div>

    );
}

export default NavigationTabs;
