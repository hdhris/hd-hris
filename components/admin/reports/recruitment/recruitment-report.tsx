"use client"
import React, {useMemo} from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import ReportControls from "@/components/admin/reports/reports-controls/report-controls";
import useSWR from "swr";
import {toGMT8} from "@/lib/utils/toGMT8";
import {LeaveReports} from "@/types/report/leaves/leave-types";
import NoData from "@/components/common/no-data/NoData";
import {useControl} from "@/components/admin/reports/reports-controls/provider/reports-control-provider";

function RecruitmentReport() {
    const {value} = useControl()
    SetNavEndContent(() => {
        return <ReportControls/>
    })
    const {data, isLoading} = useSWR(`/api/admin/reports/recruitment?start=${toGMT8(value.date.start).format("YYYY-MM-DD")}&end=${toGMT8(value.date.end).format("YYYY-MM-DD")}`)

    const newlyHired: EmployeeRecruitement[] =  useMemo(() => {
        if(data) return data.results
        return []
    }, [data])
    return (<div className="h-full flex flex-col gap-4">
        <table className="w-full border-collapse p-2">
            <thead className="bg-gray-100 sticky top-0">
            <tr>
                <th className="p-3 text-left border text-[7pt]">ID</th>
                <th className="p-3 text-left border text-[7pt]">Name</th>
                <th className="p-3 text-left border text-[7pt]">Email</th>
                <th className="p-3 text-left border text-[7pt]">Phone Number</th>
                <th className="p-3 text-left border text-[7pt]">Department</th>
                <th className="p-3 text-left border text-[7pt]">Job</th>
                <th className="p-3 text-left border text-[7pt]">Working Status</th>
                <th className="p-3 text-left border text-[7pt]">Hired Date</th>
            </tr>
            </thead>
            <tbody>
            {newlyHired ? newlyHired.map((item, index) => {
                return <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border text-[7pt]">{item.id}</td>
                    <td className="p-3 border text-[7pt]">{item.name}</td>
                    <td className="p-3 border text-[7pt]">{item.email}</td>
                    <td className="p-3 border text-[7pt]">{item.phone}</td>
                    <td className="p-3 border text-[7pt]">{item.department}</td>
                    <td className="p-3 border text-[7pt]">{item.job}</td>
                    <td className="p-3 border text-[7pt]">{item.working_status}</td>
                    <td className="p-3 border text-[7pt]">{item.hired_date}</td>
                </tr>
            }) : <NoData message="No Leave found."/>}
            </tbody>
        </table>
    </div>);
}

export default RecruitmentReport;