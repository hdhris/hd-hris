'use client'
import React, { ReactNode } from 'react';
import {Tab, Tabs} from "@nextui-org/react";
import {usePathname, useRouter} from "next/navigation";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import { NavEndContext } from '@/contexts/common/tabs/NavigationContext';

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
    const [endContent, setEndContent] = React.useState(<div/>)
    const router = useRouter();
    const pathname = usePathname();

    // Determine the active tab based on the current pathname
    const activeTab = tabs.find(tab => pathname.includes(tab.key))?.key || tabs[0].key;

    const handleTabChange = (key: string) => {
        router.push(`/${basePath}/${key}`);
    };

    return (
        <div className="flex flex-col space-y-4 h-full">
            <div className='flex justify-between items-center'>
                <Tabs
                    classNames={{ tab:'data-[selected=true]:bg-white data-[selected=true]:border-1'}}
                    radius='lg'
                    aria-label="Navigation Tabs"
                    disableAnimation
                    selectedKey={activeTab}
                    onSelectionChange={(key) => handleTabChange(key as string)}
                >
                    {tabs.map(tab => (
                        <Tab key={tab.key} title={tab.title}/>
                    ))}
                </Tabs>
                {endContent}
            </div>
            <NavEndContext.Provider value={setEndContent}>
                <div className="h-full overflow-hidden">{children}</div>
            </NavEndContext.Provider>
        </div>

    );
}

export default NavigationTabs;

export function setNavEndContent(children: ReactNode){
    const setEndContent = React.useContext(NavEndContext);
    React.useEffect(() => {
        setEndContent(<>{children}</>);

        return () => setEndContent(<div/>);
    }, [setEndContent]);
}