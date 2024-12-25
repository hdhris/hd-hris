"use client";
import { ReactNode } from "react";
import NavigationTabs, { TabItem } from "@/components/common/tabs/NavigationTabs";

function RootLayout({ children }: { children: ReactNode }) {
    const tabs: TabItem[] = [
        {
            key: "criteria",
            title: "Criteria",
            path: "criteria",
        },
        {
          key: "employees",
          title: "Employees",
          path: "employees",
      },
    ];

    return (
        <NavigationTabs tabs={tabs} basePath="performance">
            {children}
        </NavigationTabs>
    );
}

export default RootLayout;
