"use client"
import React from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import ReportControls from "@/components/admin/reports/reports-controls/report-controls";
import ReportTable from "@/components/admin/reports/reports-controls/report-table";

function BenefitReport() {
    SetNavEndContent(() => {
        return <ReportControls/>
    })
    return (<div className="h-full">
        <ReportTable endpoint="/api/admin/reports/attendance-logs" columns={{
            columns: [
                {
                    uid: "id",
                    name: "ID",
                    sortable: true
                },{
                    uid: "employee",
                    name: "Name",
                    sortable: true,
                },{
                    uid: "department",
                    name: "Department",
                    sortable: true,
                },{
                    uid: "timestamp",
                    name: "Timestamp"
                },{
                    uid: "status",
                    name: "Status",
                },{
                    uid: "punch",
                    name: "Punch",
                }
            ]
        }}/>
    </div>);
}

export default BenefitReport;