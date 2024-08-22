"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, Tab } from "@nextui-org/react";
import BreadcrumbComponent from "@/components/common/breadcrumb";

type TabKeys = "employees" | "suspend" | "resign" | "appraisal";

const RootLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname(); 
  const [activeTab, setActiveTab] = useState<TabKeys>("employees");

  useEffect(() => {
    // Redirect to /employeemanagement/employees if at /employeemanagement
    if (pathname === "/employeemanagement") {
      router.replace("/employeemanagement/employees");
    } else {
      const currentTab = pathname.includes("suspend")
        ? "suspend"
        : pathname.includes("resign")
        ? "resign"
        : pathname.includes("appraisal")
        ? "appraisal"
        : "employees";
      setActiveTab(currentTab);
    }
  }, [pathname, router]);

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
    appraisal: [
      { title: "Employee Management", link: "/employeemanagement" },
      { title: "Appraisal", link: "/employeemanagement/appraisal" },
    ],
  };

  return (
    <div>
      <BreadcrumbComponent paths={breadcrumbPaths[activeTab]} />
      
      <Tabs
        aria-label="Employee Management Tabs"
        disableAnimation
        selectedKey={activeTab}
        onSelectionChange={(key) => handleTabChange(key as TabKeys)}
      >
        <Tab key="employees" title="Employees" />
        <Tab key="suspend" title="Suspend" />
        <Tab key="resign" title="Resign" />
        <Tab key="appraisal" title="Appraisal" />
      </Tabs>

      <div className="scroll-shadow">
        {children}
      </div>
    </div>
  );
};

export default RootLayout;
