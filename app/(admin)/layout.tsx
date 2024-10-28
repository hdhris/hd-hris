'use client'
import React, {ReactNode, useEffect, useState} from 'react';
import {cn, NavbarItem} from "@nextui-org/react";
import {PiUsersThree} from "react-icons/pi";
import {RxDashboard} from "react-icons/rx";
import {FiClock} from "react-icons/fi";
import {LuBadgeCheck, LuFileWarning, LuHeartHandshake, LuPersonStanding, LuPlane, LuTicket} from "react-icons/lu";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {BiStats} from "react-icons/bi";
import SideBarItem from "@/components/sidebar/SideBarItem";
import SideBar from "@/components/sidebar/SideBar";
import NavBar from "@/components/navbar/NavBar";
import UserMenu from "@/components/dropdown/UserMenu";
import Notification from '@/components/functions/notifications/Notification'
import {LiaUsersSolid} from "react-icons/lia";
import {useIsClient} from "@/hooks/ClientRendering";
import Loading from "@/components/spinner/Loading";

function RootLayout({children}: { children: ReactNode }) {
    // Use a function to lazily initialize the state
    const isClient = useIsClient();
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

    if (!isClient) return <div className="h-screen w-screen"><Loading/></div>

    return (<main
        className="h-full w-full fixed top-0 left-0 flex bg-[#FAFAFA] overflow-x-auto overflow-y-hidden">
        {/* NavBar fixed at the top */}
        <NavBar className="fixed top-0 left-0 w-full z-20">
            <NavContent/>
        </NavBar>

        {/* SideBar fixed at the left */}
        <section className={cn("sticky mt-12 top-[calc(100% - 48px] left-0 flex")}>
            <div className="relative group"
                 onMouseEnter={() => {
                     if (!isSidebarOpen) toggleSidebar(); // Expand the sidebar on hover
                 }}
                 onMouseLeave={() => {
                     if (isSidebarOpen) toggleSidebar(); // Collapse the sidebar when not hovered
                 }}
            >
                <SideBar
                    onClockShow={isSidebarOpen}
                    className={cn("transition-width z-40 group-hover:w-52", isSidebarOpen ? "w-52" : "w-16")}
                >
                    <SideBarItem label="Dashboard" href="/dashboard" icon={<RxDashboard/>} showLabel={isSidebarOpen}/>
                    <SideBarItem label="Employee Management" href="/employeemanagement" icon={<PiUsersThree/>}
                                 showLabel={isSidebarOpen}/>
                    <SideBarItem label="Attendance & Time" href="/attendance-time" icon={<FiClock/>}
                                 showLabel={isSidebarOpen}/>
                    <SideBarItem label="Leaves Application" href="/leaves" icon={<LuPlane/>}
                                 showLabel={isSidebarOpen}/>
                    <SideBarItem label="Payroll" href="/payroll" icon={<LuTicket/>} showLabel={isSidebarOpen}/>
                    <SideBarItem label="Benefits" href="/benefits" icon={<LuHeartHandshake/>}
                                 showLabel={isSidebarOpen}/>
                    <SideBarItem label="Performance Appraisal" href="/performance" icon={<LuBadgeCheck/>}
                                 showLabel={isSidebarOpen}/>
                    <SideBarItem label="Privileges" href="/privileges" icon={<LuPersonStanding/>}
                                 showLabel={isSidebarOpen}/>
                    <SideBarItem label="Incident Report" href="/incident/" icon={<LuFileWarning/>}
                                 showLabel={isSidebarOpen}/>
                    <SideBarItem label="Training And Seminars" href="/training&seminars" icon={<LiaUsersSolid/>}
                                 showLabel={isSidebarOpen}/>
                    <SideBarItem label="Reports" href="/reports/" icon={<BiStats/>} showLabel={isSidebarOpen}/>
                </SideBar>

            </div>
        </section>


        <ScrollShadow className="absolute p-4 mt-14 left-14 w-[calc(100%-56px)] h-full min-w-[980px] -z-10 pb-[70px]">
            {children}
        </ScrollShadow>

    </main>);
}


const NavContent = () => {
    return (<NavbarItem className="flex gap-10 items-center justify-center mt-2">
        {/*<AuditSignatories/>*/}
        <Notification/>
        <UserMenu/>
    </NavbarItem>);
};

export default RootLayout;