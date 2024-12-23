'use client'
import React, {ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {cn, NavbarItem} from "@nextui-org/react";
import {PiSignatureBold, PiUsersThree} from "react-icons/pi";
import {RxDashboard} from "react-icons/rx";
import {FiClock} from "react-icons/fi";
import {LuBadgeCheck, LuFileWarning, LuHeartHandshake, LuPersonStanding, LuPlane, LuTicket} from "react-icons/lu";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {BiStats} from "react-icons/bi";
import SideBarItem from "@/components/sidebar/SideBarItem";
import SideBar from "@/components/sidebar/SideBar";
import NavBar from "@/components/navbar/NavBar";
import UserMenu from "@/components/dropdown/UserMenu";
import InAppNotification from '@/components/functions/notifications/Notification'
import {LiaUsersSolid} from "react-icons/lia";
import {useIsClient} from "@/hooks/ClientRendering";
import Loading from "@/components/spinner/Loading";
import {useModulePath} from '../../hooks/privilege-hook';
import toast, {Toaster} from "react-hot-toast";
import {useNotification} from "@/services/queries";
import {SystemNotification} from "@/types/notifications/notification-types";
import {isEqual} from "lodash";

function RootLayout({children}: { children: ReactNode }) {

    // Use a function to lazily initialize the state
    const isClient = useIsClient();
    const {isModuleAuthorized} = useModulePath();
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
                    {isModuleAuthorized('Dashboard') && <SideBarItem label="Dashboard" href="/dashboard" icon={<RxDashboard/>} showLabel={isSidebarOpen}/>}
                    {isModuleAuthorized('Employees') && <SideBarItem label="Employee Management" href="/employeemanagement" icon={<PiUsersThree/>}
                                 showLabel={isSidebarOpen}/>}
                    {isModuleAuthorized('Attendance and Time') &&<SideBarItem label="Attendance & Time" href="/attendance-time" icon={<FiClock/>}
                                 showLabel={isSidebarOpen}/>}
                    {isModuleAuthorized('Leaves') && <SideBarItem label="Leaves Application" href="/leaves" icon={<LuPlane/>}
                                 showLabel={isSidebarOpen}/>}
                    {isModuleAuthorized('Payroll') && <SideBarItem label="Payroll" href="/payroll" icon={<LuTicket/>} showLabel={isSidebarOpen}/>}
                    {isModuleAuthorized('Benefits') && <SideBarItem label="Benefits" href="/benefits" icon={<LuHeartHandshake/>}
                                 showLabel={isSidebarOpen}/>}
                    {isModuleAuthorized('Performance Appraisal') && <SideBarItem label="Performance Appraisal" href="/performance" icon={<LuBadgeCheck/>}
                                 showLabel={isSidebarOpen}/>}
                    {isModuleAuthorized('Privileges') && <SideBarItem label="Privileges" href="/privileges" icon={<LuPersonStanding/>}
                                 showLabel={isSidebarOpen}/>}
                    {isModuleAuthorized('Incident') && <SideBarItem label="Incident Report" href="/incident/" icon={<LuFileWarning/>}
                                 showLabel={isSidebarOpen}/>}
                    {isModuleAuthorized('Trainings and Seminars') &&<SideBarItem label="Training And Seminars" href="/trainings-and-seminars" icon={<LiaUsersSolid/>}
                                 showLabel={isSidebarOpen}/>}
                    {isModuleAuthorized('Signatories') &&<SideBarItem label="Signatories" href="/signatories" icon={<PiSignatureBold/>}
                                 showLabel={isSidebarOpen}/>}
                    {isModuleAuthorized('Reports') && <SideBarItem label="Reports" href="/reports/" icon={<BiStats/>} showLabel={isSidebarOpen}/>}
                </SideBar>

            </div>
        </section>


        <ScrollShadow className="absolute p-4 mt-14 left-14 w-[calc(100%-56px)] h-full min-w-[1200px] -z-10 pb-[70px]">
            {children}
        </ScrollShadow>

    </main>);
}


const NavContent = () => {
    const {data, isLoading} = useNotification();
    const currentData = useRef<SystemNotification | null | undefined>(null);
    const unreadCount = data?.notifications.filter((n) => !n.is_read).length ?? 0

    useEffect(() => {
        if (!isEqual(currentData.current, data)) {
            currentData.current = data;
            if(unreadCount > 0){
                toast.success("You have " + unreadCount + " new notifications", {
                    duration: 5000,
                    icon: "🔔",

                });
                const audio = new Audio("/notification-sounds/Pikachu notification.mp3")
                audio.load()
                audio.muted = false
                audio.play()
            }

        }
    }, [unreadCount, data]);
    return (<NavbarItem className="flex gap-10 items-center justify-center mt-2">
        {/*<AuditSignatories/>*/}
        <InAppNotification data={data!} isLoading={isLoading}/>
        <UserMenu/>
    </NavbarItem>);
};

export default RootLayout;