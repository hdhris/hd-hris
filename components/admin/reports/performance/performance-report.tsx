"use client"
import React from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import ReportControls from "@/components/admin/reports/reports-controls/report-controls";
import BenefitReport from "@/components/admin/reports/benefits/benefit-report";

function PerformanceReport() {
    SetNavEndContent(() => {
        return <ReportControls/>
    })
    return (<div className="h-full">
    </div>);
}

export default PerformanceReport;