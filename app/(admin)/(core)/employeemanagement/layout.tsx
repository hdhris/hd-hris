"use client";
import { ReactNode } from "react";
import NavigationTabs, { TabItem } from "@/components/common/tabs/NavigationTabs";
import BreadcrumbComponent from "@/components/common/breadcrumb";
import { usePathname } from "next/navigation";

type TabKeys =
  | "employees"
  | "suspend"
  | "resign"
  | "departments"
  | "jobposition";
//

function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeTab = pathname.includes("suspend")
    ? "suspend"
    : pathname.includes("resign")
    ? "resign"
    : pathname.includes("departments")
    ? "departments"
    : pathname.includes("jobposition")
    ? "jobposition"
    : "employees";
  const tabs: TabItem[] = [
    {
      key: "employees",
      title: "Employees",
      path: "employees",
    },
    // {
    //   key: "suspend",
    //   title: "Suspend",
    //   path: "suspend",
    // },
    // {
    //   key: "resign",
    //   title: "Resign",
    //   path: "resign",
    // },
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
  ];

  return (
    <div className="flex flex-col gap-2">
      <NavigationTabs tabs={tabs} basePath="employeemanagement">
        {children}
      </NavigationTabs>
    </div>
  );
}

export default RootLayout;