"use client";
import {ReactNode} from "react";
import NavigationTabs, {TabItem} from "@/components/common/tabs/NavigationTabs";
import ControlProvider from "@/components/admin/reports/reports-controls/provider/reports-control-provider";

function RootLayout({children}: { children: ReactNode }) {
    const tabs: TabItem[] = [{
        key: "attendances-report", title: "Attendance Report", path: "attendance-report"
    }, {
        key: "benefit-report", title: "Benefit Report", path: "benefit-report"
    }, {
        key: "leave-report", title: "Leave Report", path: "leave-report"
    }, {
        key: "payroll-report", title: "Payroll Report", path: "payroll-report"
    },{
        key: "recruitment-report", title: "Recruitment Report", path: "recruitment-report"
    }]

    return (<ControlProvider>
            <NavigationTabs tabs={tabs} basePath="reports">
                {children}
            </NavigationTabs>
        </ControlProvider>);
}

export default RootLayout;
