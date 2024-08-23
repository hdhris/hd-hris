'use client'
import React, { ReactNode, useEffect, useState } from 'react';
import {cn, NavbarItem} from "@nextui-org/react";
import { PiUsersThree } from "react-icons/pi";
import { RxDashboard } from "react-icons/rx";
import { FiClock } from "react-icons/fi";
import {
    LuBadgeCheck,
    LuChevronLeft,
    LuChevronRight,
    LuCoins, LuFileWarning, LuHeartHandshake,
    LuPersonStanding,
    LuPlane,
    LuTicket
} from "react-icons/lu";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import {BiStats} from "react-icons/bi";
import SideBarItem from "@/components/sidebar/SideBarItem";
import SideBar from "@/components/sidebar/SideBar";
import NavBar from "@/components/navbar/NavBar";
// import AuditSignatories from "@/components/dashboard/AuditSignatories";
import UserMenu from "@/components/dropdown/UserMenu";
import Notification from '@/components/functions/notifications/Notification'
import AuditSignatories from "@/components/admin/dashboard/AuditSignatories";
function RootLayout({ children }: { children: ReactNode }) {
    // Use a function to lazily initialize the state
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== "undefined") {
            // Check localStorage for the initial value if on the client side
            return localStorage.getItem("isSidebarOpen") === "true";
        }
        return false; // Default value for server-side rendering
    });

    useEffect(() => {
        // This effect runs only on the client side
        const savedSidebarState = localStorage.getItem("isSidebarOpen");
        if (savedSidebarState !== null) {
            setIsSidebarOpen(savedSidebarState === "true");
        }
    }, []);

    const toggleSidebar = () => {
        const newSidebarState = !isSidebarOpen;
        setIsSidebarOpen(newSidebarState);
        localStorage.setItem("isSidebarOpen", JSON.stringify(newSidebarState));
    };

    return (
        <main className="h-full w-full fixed top-0 left-0 flex bg-[#FAFAFA] overflow-x-auto md:overflow-hidden overflow-y-hidden">
            {/* NavBar fixed at the top */}
            <NavBar className="fixed top-0 left-0 w-full z-20">
                <NavContent />
            </NavBar>

            {/* SideBar fixed at the left */}
            <section className="sticky mt-12 top-[calc(100% - 48px] left-0 flex z-10">
                <SideBar
                    onClockShow={isSidebarOpen}
                    className={cn(
                        "transition-width",
                        isSidebarOpen ? "w-52" : "w-16"
                    )}
                >
                    <SideBarItem label="Dashboard" href="/dashboard" icon={<RxDashboard />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Employee Management" href="/employeemanagement" icon={<PiUsersThree />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Attendance & Time" href="/attendance-time" icon={<FiClock />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Leaves Application" href="/leaves" icon={<LuPlane />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Payroll" href="/payroll" icon={<LuTicket />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Benefits" href="/benefits" icon={<LuHeartHandshake />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Performance Appraisal" href="/performance" icon={<LuBadgeCheck />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Privileges" href="/privileges" icon={<LuPersonStanding />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Incident Report" href="/incident-report" icon={<LuFileWarning />} showLabel={isSidebarOpen} />
                    <SideBarItem label="Reports" href="/reports" icon={<BiStats />} showLabel={isSidebarOpen} />
                </SideBar>

                <div
                    className={cn(
                        "absolute top-1/2 transform -translate-y-1/2 p-1 bg-white z-10 ring-2 ring-gray-200 ring-inset cursor-pointer rounded-full transition-all duration-300 ease-in-out left-[calc(100%-10px)]",
                        // isSidebarOpen ? "left-[calc(100%-40px)]" : "left-[calc(100%-10px)]"
                    )}
                    onClick={toggleSidebar}
                >
                    {isSidebarOpen ? <LuChevronLeft /> : <LuChevronRight />}
                </div>
            </section>

            <ScrollShadow className="p-4 mt-16 mb-4 w-full min-w-[980px]">
                {children}
            </ScrollShadow>

        </main>
    );
}

const NavContent = () => {
    return (
        <NavbarItem className="flex gap-10 items-center justify-center mt-2">
            <AuditSignatories/>
            <Notification />
            <UserMenu />
        </NavbarItem>
    );
};

export default RootLayout;
