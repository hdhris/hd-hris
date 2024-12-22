"use client"
import React from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import ReportControls from "@/components/admin/reports/reports-controls/report-controls";

function RecruitmentReport() {
    SetNavEndContent(() => {
        return <ReportControls/>
    })
    return (<div className="h-full">

    </div>);
}

export default RecruitmentReport;