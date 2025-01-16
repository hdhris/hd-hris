import React from 'react';
import {DashboardStats, SalaryData, TopSalaries} from "@/components/admin/dashboard/DashboardStats";
import BorderCard from "@/components/common/BorderCard";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {toGMT8} from "@/lib/utils/toGMT8";
import type {Metadata} from "next";


export const metadata: Metadata = {
    title: "Dashboard | HRiS"
}

function Page() {
    const isMorning = toGMT8().format("A") === "AM"
    return (<div className="h-full overflow-hidden">
            <ScrollShadow className="overflow-y-auto h-full p-2">
                <section className='grid grid-rows-[auto,1fr] gap-4 h-full'>
                    <div className='grid grid-cols-4 gap-4 w-full'>
                        <DashboardStats/>
                    </div>
                    <div className='grid grid-cols-4 gap-4 w-full pb-6'>
                        <SalaryData/>
                        <BorderCard heading={`Attendance Logs (${isMorning ? "Morning" : "Afternoon"})`}
                                    className='overflow-hidden'>
                            <TopSalaries/>
                        </BorderCard>

                    </div>
                </section>
            </ScrollShadow>
        </div>

    );
}


export default Page;