import React, {ReactNode} from 'react';
import {NavbarItem, ScrollShadow} from "@nextui-org/react";
import UserMenu from "@/components/dropdown/UserMenu";
import SideBar from '@/components/sidebar/SideBar';
import SideBarItem from '@/components/sidebar/SideBarItem';
import NavBar from "@/components/navbar/NavBar";
import {PiUsersThree} from "react-icons/pi";
import {RxDashboard} from "react-icons/rx";
import {FiClock} from "react-icons/fi";
import {LuBadgeCheck, LuCoins, LuTicket} from "react-icons/lu";
import {CiReceipt} from "react-icons/ci";
import Notification from "@/components/functions/notifications/Notification";


function RootLayout({children}: { children: ReactNode }) {
    return (
        <main className="h-screen w-screen flex bg-[#FAFAFA]">
            {/* NavBar fixed at the top */}
            <NavBar className="fixed top-0 left-0 w-full z-20">
                <NavContent/>
            </NavBar>

            {/*SideBar fixed at the left */}
            <section className="bg-red-500 h-full w-fit fixed top-12 ">
                <SideBar>
                    <SideBarItem label="Dashboard" href="/admin/dashboard" icon={<RxDashboard/>}/>
                    <SideBarItem label="Employees" href="/admin/employee" icon={<PiUsersThree/>}/>
                    <SideBarItem label="Attendance & Time" href="/admin/attendance" icon={<FiClock/>}/>
                    <SideBarItem label="Cash Advance" href="/admin/cash_advance" icon={<LuCoins/>}/>
                    <SideBarItem label="Payroll" href="/admin/payroll" icon={<LuTicket/>}/>
                    <SideBarItem label="Performance" href="/admin/performance" icon={<LuBadgeCheck/>}/>
                    {/*<SideBarCollapse label="Employees" icon={<HiUserGroup/>}>*/}
                    {/*    <SideBarItem label="Employees" href="/admin/employees"/>*/}
                    {/*    <SideBarItem label="Suspended" href="/admin/suspended"/>*/}
                    {/*    <SideBarItem label="Resign" href="/admin/resign"/>*/}
                    {/*    <SideBarItem label="Department" href="/admin/department"/>*/}
                    {/*</SideBarCollapse>*/}
                    {/*<SideBarCollapse label="Attendance" icon={<FaCalendarAlt/>}>*/}
                    {/*    <SideBarItem label="Records" href="/admin/attendance/records"/>*/}
                    {/*    <SideBarItem label="Leaves" href="/admin/attendance/leaves"/>*/}
                    {/*    <SideBarItem label="Overtime" href="/admin/attendance/overtime"/>*/}
                    {/*</SideBarCollapse>*/}
                    {/*<SideBarCollapse label="Payroll" icon={<FaReceipt/>}>*/}
                    {/*    <SideBarItem label="Pay Heads" href="/admin/payroll/payheads"/>*/}
                    {/*    <SideBarItem label="Payslips" href="/admin/payroll/payslips"/>*/}
                    {/*</SideBarCollapse>*/}
                    {/*<SideBarItem label="Report" href="/admin/report" icon={<BiStats/>}/>*/}
                    {/*<SideBarItem label="Config" href="/admin/config" icon={<FaScrewdriverWrench/>}/>*/}
                    {/*<Divider/>*/}
                    {/*<SideBarItem label="Notifications" href="/notif" icon={<IoIosNotifications className="w-5 h-5"/>}/>*/}
                </SideBar>
            </section>

            {/* Main content section */}
            <ScrollShadow className="flex-1 p-4 mt-16 mb-4 ml-48 overflow-y-auto">
                {children}
            </ScrollShadow>
        </main>
    );
}

const NavContent = () => {
    return (<>
        <NavbarItem className="flex gap-10 items-center justify-center mt-2">
            <Notification/>
            <UserMenu/>
        </NavbarItem>

    </>);
};

export default RootLayout;