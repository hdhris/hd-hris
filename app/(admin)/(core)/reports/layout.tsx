"use client";
import { ReactNode } from "react";
import NavigationTabs, { TabItem } from "@/components/common/tabs/NavigationTabs";

function RootLayout({ children }: { children: ReactNode }) {
    const tabs : TabItem[] = [
        {
          key: "attendance-report",
          title: "Attendance Report",
          path: "attendance-report"
        },
        {
            key: "benefit-report",
            title: "Benefit Report",
            path: "benefit-report"
        },{
            key: "leave-report",
            title: "Leave Report",
            path: "leave-report"
        },{
            key: "payroll-report",
            title: "Payroll Report",
            path: "payroll-report"
        },{
            key: "performance-report",
            title: "Performance Report",
            path: "performance-report"
        },{
            key: "recruitment-report",
            title: "Recruitment Report",
            path: "recruitment-report"
        }
    ]

    return (
        <NavigationTabs tabs={tabs} basePath="reports">{children}</NavigationTabs>
    );
}

export default RootLayout;
