"use client"
import React, {useCallback, useState} from 'react';
import {Button} from "@nextui-org/button";
import {DashboardStats, SalaryData, TopSalaries} from "@/components/admin/dashboard/DashboardStats";
import BorderCard from "@/components/common/BorderCard";
import {btnClass} from "@/lib/utils";
import {cn, SharedSelection} from "@nextui-org/react";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import dayjs from "dayjs";
import {toGMT8} from "@/lib/utils/toGMT8";
import {useSession} from "next-auth/react";


function Page() {
    const session = useSession();
    const todayMonth = dayjs().month(); // Assuming `toGMT8().month()` gives a 0-based index
    const semester = todayMonth < 6;
    const [btnFocus1stSem, setBtnFocus1stSem] = useState(semester);
    const [btnFocus2ndSem, setBtnFocus2ndSem] = useState(!semester);
    const [sem, setSem] = useState<string>(semester ? "1" : "2")
    const currentYear = new Date().getFullYear();
    const yearRange = Array.from({length: currentYear - 2020 + 1}, (_, i) => currentYear - i); // Adjust range as needed
    const [year, setYear] = useState<number>(currentYear);
    console.table(session.data?.user);
    const handleBtnFocus2ndSem = useCallback(() => {
        setBtnFocus2ndSem(true);
        setBtnFocus1stSem(false);
        setSem("1")
    }, []);

    const handleBtnFocus1stSem = useCallback(() => {
        setBtnFocus2ndSem(false);
        setBtnFocus1stSem(true);
        setSem("2")
    }, []);


    const handleYearChange = useCallback((key: SharedSelection) => {
        const selectedYear = Number(Array.from(key)[0]);
        setYear(selectedYear);
    }, []);

    useDocumentTitle("Dashboard | HRiS");
    const isMorning = toGMT8().format("A") === "AM"
    return (<div className="h-full overflow-hidden">
            <ScrollShadow className="overflow-y-auto h-full p-2">
                <section className='grid grid-rows-[auto,1fr] gap-4 h-full'>
                    <div className='grid grid-cols-4 gap-4 w-full'>
                        <DashboardStats/>
                    </div>
                    <div className='grid grid-cols-4 gap-4 w-full pb-6'>
                        <SalaryData/>
                        <BorderCard heading={`Attendance Logs (${isMorning ? "Morning" : "Afternoon"})`} className='overflow-hidden'>
                            <TopSalaries/>
                        </BorderCard>
                        {/*<div className="flex flex-col gap-4 w-full h-full">*/}
                        {/*    /!*<BorderCard heading=''>*!/*/}
                        {/*    /!*    <div className="flex items-center justify-center">*!/*/}
                        {/*    /!*        <div className="flex flex-col lg:w-full items-center justify-center gap-3">*!/*/}
                        {/*    /!*            <h5 className="leading-none text-xl font-semibold text-gray-600 dark:text-white pb-1">Payroll*!/*/}
                        {/*    /!*                Date</h5>*!/*/}
                        {/*    /!*            <h6 className="text-xl font-bold text-gray-500 dark:text-gray-400">01/21/2024</h6>*!/*/}
                        {/*    /!*            <div className="w-full space-y-2">*!/*/}
                        {/*    /!*                <p className="text-xs text-gray-500 font-normal text-center">Payroll*!/*/}
                        {/*    /!*                    Run: <span*!/*/}
                        {/*    /!*                        className="font-semibold"><span>01/15/2024</span> — <span>01/30/2024</span></span>*!/*/}
                        {/*    /!*                </p>*!/*/}
                        {/*    /!*                <div className="flex gap-2 ">*!/*/}
                        {/*    /!*                    <Button className={cn("w-full", btnClass)} variant='light'*!/*/}
                        {/*    /!*                            color='primary'>Deploy*!/*/}
                        {/*    /!*                        Payroll</Button>*!/*/}
                        {/*    /!*                    <Button className={cn("w-full", btnClass)}*!/*/}
                        {/*    /!*                            color='primary'>Download</Button>*!/*/}
                        {/*    /!*                </div>*!/*/}

                        {/*    /!*            </div>*!/*/}
                        {/*    /!*        </div>*!/*/}
                        {/*    /!*    </div>*!/*/}
                        {/*    /!*</BorderCard>*!/*/}
                        {/*    */}
                        {/*</div>*/}
                    </div>

                    {/*<div className='grid grid-cols-5 gap-4 w-full h-1/2'>*/}
                    {/*    <BorderCard className='space-y-4 w-full col-span-3'*/}
                    {/*                heading="Leave Status Overview"*/}
                    {/*                endContent={<Button radius='none' size='sm' color='default' variant='bordered'*/}
                    {/*                                    className={btnClass}*/}
                    {/*                                    startContent={<LuMaximize className={icon_color}/>}>View*/}
                    {/*                    More</Button>}>*/}
                    {/*        <LeaveData/>*/}
                    {/*    </BorderCard>*/}
                    {/*    <ActiveLeaves/>*/}
                    {/*</div>*/}
                </section>
            </ScrollShadow>
        </div>

    );
}


export default Page;