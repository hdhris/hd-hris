"use client"
import React, { useMemo } from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import ReportControls from "@/components/admin/reports/reports-controls/report-controls";
import ReportTable from "@/components/admin/reports/reports-controls/report-table";
import {useControl} from "@/components/admin/reports/reports-controls/provider/reports-control-provider";
import useSWR from "swr";
import {toGMT8} from "@/lib/utils/toGMT8";
import {LeaveReports} from "@/types/report/leaves/leave-types";
import NoData from '@/components/common/no-data/NoData';
import Loading from '@/components/spinner/Loading';

function LeavesReport() {
    const {value} = useControl()
    SetNavEndContent(() => {
        return <ReportControls allowMaxDate/>
    })

    const {data, isLoading} = useSWR(`/api/admin/reports/leaves-report?start=${toGMT8(value.date.start).format("YYYY-MM-DD")}&end=${toGMT8(value.date.end).format("YYYY-MM-DD")}`)

    const leave: LeaveReports[] =  useMemo(() => {
        if(data) return data.results
        return []
    }, [data])
    console.log({data})
    return (<div className="h-full flex flex-col gap-4">
        {leave && leave.length > 0 ? <table className="w-full border-collapse p-2">
            <thead className="bg-gray-100 sticky top-0">
            <tr>
                <th className="p-3 text-left border text-[7pt]">ID</th>
                <th className="p-3 text-left border text-[7pt]">Name</th>
                <th className="p-3 text-left border text-[7pt]">Department</th>
                <th className="p-3 text-left border text-[7pt]">Working Status</th>
                <th className="p-3 text-left border text-[7pt]">Leave Type</th>
                <th className="p-3 text-right border text-[7pt]">Leave Status</th>
                <th className="p-3 text-right border text-[7pt]">Leave Start Date</th>
                <th className="p-3 text-right border text-[7pt]">Leave End Date</th>
                <th className="p-3 text-right border text-[7pt]">Leave Duration</th>
                <th className="p-3 text-right border text-[7pt]">Leave Reason</th>
                <th className="p-3 text-right border text-[7pt]">Allocated Days</th>
                {/*<th className="p-3 text-right border text-[7pt]">Carry Forward Days</th>*/}
                <th className="p-3 text-right border text-[7pt]">Remaining Days</th>
                <th className="p-3 text-right border text-[7pt]">Used Days</th>
            </tr>
            </thead>
            <tbody>
            {leave.map((item, index) => {
                return <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border text-[7pt]">{item.id}</td>
                    <td className="p-3 border text-[7pt]">{item.employee}</td>
                    <td className="p-3 border text-[7pt]">{item.department}</td>
                    <td className="p-3 border text-[7pt]">{item.work_status}</td>
                    <td className="p-3 border text-[7pt]">{item.leave_type}</td>
                    <td className="p-3 border text-[7pt]">{item.leave_status}</td>
                    <td className="p-3 border text-[7pt]">{item.leave_start_date}</td>
                    <td className="p-3 border text-[7pt]">{item.leave_end_date}</td>
                    <td className="p-3 border text-[7pt]">{item.leave_duration}</td>
                    <td className="p-3 border text-[7pt]">{item.leave_reason}</td>
                    <td className="p-3 border text-[7pt]">{item.leave_allocated_days}</td>
                    <td className="p-3 border text-[7pt]">{item.leave_used_days}</td>
                    <td className="p-3 border text-[7pt]">{item.leave_remaining_days}</td>

                </tr>
            })}
            </tbody>
        </table> : isLoading ? <Loading/> : <NoData message="No Leave found."/>}

    </div>);
}

export default LeavesReport;