import React from 'react';
import NavigationTabs, {TabItem} from "@/components/common/tabs/NavigationTabs";

function RootLayout({children}: { children: React.ReactNode }) {
    const tabs: TabItem[] = [
      {
              key: "employees",
              title: "Employees",
              path: "employees",
            },
            {
              key: "departments",
              title: "Departments",
              path: "departments",
            },
            {
              key: "jobposition",
              title: "Job Positions",
              path: "jobposition",
            },
            {
              key: "branch",
              title: "Branch",
              path: "branch",
            },
    ]
    return (
        <NavigationTabs tabs={tabs} basePath="employeemanagement">
            {children}
        </NavigationTabs>
    );
}

export default RootLayout;
