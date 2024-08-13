'use client'
import React, {ReactNode, useEffect, useState} from 'react';
import { NavbarItem } from "@nextui-org/react";
import UserMenu from "@/components/dropdown/UserMenu";
import SideBar from '@/components/sidebar/SideBar';
import SideBarItem from '@/components/sidebar/SideBarItem';
import NavBar from "@/components/navbar/NavBar";
import { PiUsersThree } from "react-icons/pi";
import { RxDashboard } from "react-icons/rx";
import { FiClock } from "react-icons/fi";
import { LuBadgeCheck, LuChevronLeft, LuChevronRight, LuCoins, LuTicket } from "react-icons/lu";
import Notification from "@/components/functions/notifications/Notification";
import { cn, icon_size_sm } from "@/lib/utils";
import {ScrollShadow} from "@nextui-org/scroll-shadow";

function RootLayout({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(localStorage.getItem("isSidebarOpen") === "true");

    const toggleSidebar = () => {
        const newSidebarState = !isSidebarOpen;
        setIsSidebarOpen(newSidebarState);
        localStorage.setItem("isSidebarOpen", JSON.stringify(newSidebarState));
    };

    // useEffect(() => {
    //     const storedSidebarState = localStorage.getItem("isSidebarOpen");
    //     if (storedSidebarState !== null) {
    //         setIsSidebarOpen(JSON.parse(storedSidebarState));
    //     }
    // }, []);

    return (
        <main className="h-full w-full flex bg-[#FAFAFA]">
            {/* NavBar fixed at the top */}
            <NavBar className="fixed top-0 left-0 w-full z-20">
                <NavContent/>
            </NavBar>

            {/* SideBar fixed at the left */}
            <section className="h-full sticky mt-12 top-12 left-0 flex z-10">
                <SideBar
                    className={cn(
                        "transition-width",
                        isSidebarOpen ? "w-52" : "w-16"
                    )}
                >
                    <SideBarItem label="Dashboard" href="/admin/dashboard" icon={<RxDashboard />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Employees" href="/admin/employees" icon={<PiUsersThree />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Attendance & Time" href="/admin/attendance-time" icon={<FiClock />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Leaves" href="/admin/leaves" icon={<LuCoins />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Payroll" href="/admin/payroll" icon={<LuTicket />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Performance Appraisal" href="/admin/performance" icon={<LuBadgeCheck />} showLabel={isSidebarOpen} />
                </SideBar>

                <div
                    className={cn(
                        "absolute top-1/2 transform -translate-y-1/2 p-1 bg-white z-10 ring-2 ring-gray-200 ring-inset cursor-pointer rounded-full transition-all duration-300 ease-in-out left-[calc(100%-10px)]",
                        // isSidebarOpen ? "left-[calc(100%-40px)]" : "left-[calc(100%-10px)]"
                    )}
                    onClick={toggleSidebar}
                >
                    {isSidebarOpen ? <LuChevronLeft/> : <LuChevronRight/>}
                </div>
            </section>

            <ScrollShadow className="flex-1 p-4 mt-16 mb-4 w-full overflow-y-auto min-w-[980px]">
                {children}
            </ScrollShadow>

        </main>
    );
}

const NavContent = () => {
    return (
        <NavbarItem className="flex gap-10 items-center justify-center mt-2">
            <Notification/>
            <UserMenu/>
        </NavbarItem>
    );
};

export default RootLayout;