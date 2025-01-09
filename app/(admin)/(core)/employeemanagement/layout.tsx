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
              key: "suspend",
              title: "Suspend",
              path: "suspend",
            },
            {
              key: "resign",
              title: "Former Employees",
              path: "resign",
            },
            {
              key: "reserved",
              title: "Reserved Employees",
              path: "reserved",
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
            {
              key: "employmentstatus",
              title: "Employment Status",
              path: "employmentstatus",
            },
            {
              key: "salarygrade",
              title: "Salary Grade",
              path: "salarygrade",
            },
    ]
    return (
        <NavigationTabs tabs={tabs} basePath="employeemanagement">
            {children}
        </NavigationTabs>
    );
}

export default RootLayout;
