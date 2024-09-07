import React from 'react';
import {Button} from "@nextui-org/button";
import {DashboardStats, LeaveData, SalaryData, TopSalaries} from "@/components/admin/dashboard/DashboardStats";
import BorderCard from "@/components/common/BorderCard";
import {btnClass, icon_color} from "@/lib/utils";
import ActiveLeaves from "@/components/admin/dashboard/ActiveLeaves";
import {LuMaximize} from "react-icons/lu";
import {cn} from "@nextui-org/react";
import {auth} from "@/auth";

async function Page() {
    const session = await auth()
    console.log(session?.id)
    return (<section className='grid grid-rows-[auto,1fr,auto, auto] gap-4 h-full'>
            <div className='grid grid-cols-4 gap-4 w-full'>
                <DashboardStats/>
            </div>
            <div className='grid grid-cols-4 gap-4 h-full w-full'>
                <SalaryData/>
                <div className="flex flex-col gap-4 w-full">
                    <BorderCard heading=''>
                        <div className="flex items-center justify-center">
                            <div className="flex flex-col lg:w-full items-center justify-center gap-3">
                                <h5 className="leading-none text-xl font-semibold text-gray-600 dark:text-white pb-1">Payroll
                                    Date</h5>
                                <h6 className="text-xl font-bold text-gray-500 dark:text-gray-400">01/21/2024</h6>
                                <div className="w-full space-y-2">
                                    <p className="text-xs text-gray-500 font-normal text-center">Payroll Run: <span
                                        className="font-semibold"><span>01/15/2024</span> — <span>01/30/2024</span></span>
                                    </p>
                                    <div className="flex gap-2 ">
                                        <Button className={cn("w-full", btnClass)} variant='light' color='primary'>Deploy
                                            Payroll</Button>
                                        <Button className={cn("w-full", btnClass)} color='primary'>Download</Button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </BorderCard>
                    <BorderCard heading='Statistics of this semi-monthly' className='h-full'>
                        <TopSalaries/>
                    </BorderCard>
                </div>
            </div>

            <div className='grid grid-cols-5 gap-4 w-full h-1/2'>
                <BorderCard className='space-y-4 w-full col-span-3'
                            heading="Leave Status Overview"
                            endContent={<Button radius='none' size='sm' color='default' variant='bordered'
                                                className={btnClass}
                                                startContent={<LuMaximize className={icon_color}/>}>View More</Button>}>
                    <LeaveData/>
                </BorderCard>
                <ActiveLeaves/>
            </div>

        </section>

    );
}

export default Page;