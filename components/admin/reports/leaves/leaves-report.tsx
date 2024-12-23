"use client"
import React from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import ReportControls from "@/components/admin/reports/reports-controls/report-controls";
import ReportTable from "@/components/admin/reports/reports-controls/report-table";

function LeavesReport() {
    SetNavEndContent(() => {
        return <ReportControls allowMaxDate/>
    })
    return (<div className="h-full flex flex-col gap-4">
        <ReportTable endpoint="/api/admin/reports/leaves-report" groupByKey="employee" columns={{
            columns: [
                {
                    uid: "id",
                    name: "ID",
                    sortable: true
                },
                {
                    uid: "employee",
                    name: "Name",
                    sortable: true
                },
                {
                    uid: "department",
                    name: "Department",
                    sortable: true
                },
                {
                    uid: "work_status",
                    name: "Work Status",
                    sortable: true
                },
                {
                    uid: "leave_type",
                    name: "Leave Type",
                    sortable: true
                },
                {
                    uid: "leave_status",
                    name: "Leave Status",
                    sortable: true
                },
                {
                    uid: "leave_start_date",
                    name: "Leave Start Date",
                    sortable: true
                },
                {
                    uid: "leave_end_date",
                    name: "Leave End Date",
                    sortable: true
                },
                {
                    uid: "leave_duration",
                    name: "Leave Duration",
                    sortable: true
                },
                {
                    uid: "leave_reason",
                    name: "Leave Reason",
                    sortable: true
                },
                {
                    uid: "leave_allocated_days",
                    name: "Allocated Days",
                    sortable: true
                },
                {
                    uid: "leave_used_days",
                    name: "Used Days",
                    sortable: true
                },
                {
                    uid: "leave_carry_forward_days",
                    name: "Carry Forward Days",
                    sortable: true
                },
                {
                    uid: "leave_remaining_days",
                    name: "Remaining Days",
                    sortable: true
                }
            ]
        }}/>
    </div>);
}

export default LeavesReport;