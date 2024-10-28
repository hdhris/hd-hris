'use client'
import React, {ReactElement, ReactNode, useContext, useEffect, useMemo} from 'react';
import {Button, Tab, Tabs} from "@nextui-org/react";
import {usePathname, useRouter} from "next/navigation";
import { NavEndContext } from '@/contexts/common/tabs/NavigationContext';
import { IoIosArrowRoundBack } from 'react-icons/io';
import HelpReport from './HelpReport';

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
    const pathPart = pathname.split('/');

    // Determine the active tab based on the current pathname
    const activeTab = tabs.find(tab => pathname.includes(tab.key))?.key || tabs[0].key;

    const handleTabChange = (key: string) => {
        router.push(`/${basePath}/${key}`);
    };

    return (
        <div className="flex flex-col space-y-4 h-full">
            <div className='flex justify-between items-center'>
                <div className='flex gap-1 items-center'>
                    {pathPart.length > 3 &&
                    <Button isIconOnly className='border-1 bg-white m-1' radius='md' size='sm' onClick={()=>{handleTabChange(pathPart[2])}}>
                        <IoIosArrowRoundBack size={20} />
                    </Button>
                    }
                    <Tabs
                        classNames={{ tab:'data-[selected=true]:bg-white data-[selected=true]:border-1'}}
                        radius='lg'
                        aria-label="Navigation Tabs"
                        selectedKey={activeTab}
                        onSelectionChange={(key) => handleTabChange(key as string)}
                    >
                        {tabs.map(tab => (
                            <Tab key={tab.key} title={tab.title}/>
                        ))}
                    </Tabs>
                    <HelpReport/>
                </div>
                <div className='flex gap-2 items-center'>{endContent}</div>
            </div>
            <NavEndContext.Provider value={setEndContent}>
                <div className="h-full overflow-hidden">{children}</div>
            </NavEndContext.Provider>
        </div>

    );
}

export default NavigationTabs;

// export function setNavEndContent(children: ReactNode){
//     const setEndContent = React.useContext(NavEndContext);
//     React.useEffect(() => {
//         setEndContent(<>{children}</>);

//         return () => setEndContent(<div/>);
//     }, [setEndContent]);
// }

export function SetNavEndContent(contentCallback: (router?: ReturnType<typeof useRouter>) => ReactElement) {
    const router = useRouter();
    const setEndContent = useContext(NavEndContext);

    useEffect(() => {
        setEndContent(contentCallback(router || undefined)); // Pass the router or undefined to the callback

        return () => setEndContent(<div />); // Clean up on unmount
    }, [setEndContent, router, contentCallback]);
}