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

const breadcrumbPaths: Record<TabKeys, { title: string; link: string }[]> = {
  employees: [
    { title: "Employee Management", link: "/employeemanagement" },
    { title: "Employees", link: "/employeemanagement/employees" },
  ],
  suspend: [
    { title: "Employee Management", link: "/employeemanagement" },
    { title: "Suspend", link: "/employeemanagement/suspend" },
  ],
  resign: [
    { title: "Employee Management", link: "/employeemanagement" },
    { title: "Resign", link: "/employeemanagement/resign" },
  ],
  departments: [
    { title: "Employee Management", link: "/employeemanagement" },
    { title: "Department", link: "/employeemanagement/department" },
  ],
  jobposition: [
    { title: "Employee Management", link: "/employeemanagement" },
    { title: "position", link: "/employeemanagement/jobposition" },
  ],
};

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
      <div>
        <BreadcrumbComponent paths={breadcrumbPaths[activeTab]} />
      </div>
      <NavigationTabs tabs={tabs} basePath="employeemanagement">
        {children}
      </NavigationTabs>
    </div>
  );
}

export default RootLayout;
