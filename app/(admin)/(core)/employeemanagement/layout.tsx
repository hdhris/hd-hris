"use client";
import React, { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, Tab } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import BreadcrumbComponent from "@/components/common/breadcrumb";

type TabKeys = "employees" | "suspend" | "resign" | "departments" | "jobposition" | "branch";

const RootLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = pathname.includes("suspend")
    ? "suspend"
    : pathname.includes("resign")
    ? "resign"
    : pathname.includes("departments")
    ? "departments"
     : pathname.includes("jobposition")
    ? "jobposition"
     : pathname.includes("branch")
    ? "branch"
    : "employees";

  const handleTabChange = (key: TabKeys) => {
    router.push(`/employeemanagement/${key}`);
  };

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
    branch: [
      { title: "Employee Management", link: "/employeemanagement" },
      { title: "branch", link: "/employeemanagement/branch" },
    ],
  };

  return (
    <div className="flex flex-col -mt-2">
      <div>
        <BreadcrumbComponent paths={breadcrumbPaths[activeTab]} />
      </div>
      <div className="mt-2 flex justify-between items-center">
        <Tabs
          aria-label="Employee Management Tabs"
          disableAnimation
          selectedKey={activeTab}
          onSelectionChange={(key) => handleTabChange(key as TabKeys)}
        >
          <Tab key="employees" title="Employees" />
          {/* <Tab key="suspend" title="Suspend" />
          <Tab key="resign" title="Resign" /> */}
          <Tab key="departments" title="Departments" />
          <Tab key="jobposition" title="Job Positions" />
          <Tab key="branch" title="Branches" />
        </Tabs>
      </div>
      <ScrollShadow>{children}</ScrollShadow>
    </div>
  );
};

export default RootLayout;
