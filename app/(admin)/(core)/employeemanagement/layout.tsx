"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, Tab } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import BreadcrumbComponent from "@/components/common/breadcrumb";
import AddEmployee from "@/components/admin/add/AddEmployees";

type TabKeys = "employees" | "suspend" | "resign" | "department";

const RootLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabKeys>("employees");

  useEffect(() => {
    const tab = pathname.includes("suspend")
      ? "suspend"
      : pathname.includes("resign")
      ? "resign"
      : pathname.includes("department")
      ? "department"
      : "employees";
    setActiveTab(tab);
  }, [pathname]);

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
    department: [
      { title: "Employee Management", link: "/employeemanagement" },
      { title: "Department", link: "/employeemanagement/appraisal" },
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
          <Tab key="suspend" title="Suspend" />
          <Tab key="resign" title="Resign" />
          <Tab key="department" title="Department" />
        </Tabs>

        <AddEmployee />
      </div>

      <ScrollShadow>{children}</ScrollShadow>
    </div>
  );
};

export default RootLayout;
