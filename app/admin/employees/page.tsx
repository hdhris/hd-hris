"use client";
import React, { useState } from "react";
import { Tabs, Tab } from "@nextui-org/react";

import BreadcrumbComponent from "@/components/common/breadcrumb";

type TabKeys = "employees" | "suspend" | "resign" | "appraisal";

const Page = () => {
  const [tabs, setTabs] = useState<TabKeys>("employees");

  const breadcrumbPaths: Record<TabKeys, { title: string; link: string }[]> = {
    employees: [
      { title: "Employee Management", link: "#" },
      { title: "Employees", link: "#" }
      ],
    suspend: [
      { title: "Employee Management", link: "#" },
      { title: "Suspend", link: "#" },
    ],
    resign: [
      { title: "Employee Management", link: "#" },
      { title: "Resign", link: "#" },
    ],
    appraisal: [
      { title: "Employee Management", link: "#" },
      { title: "Appraisal", link: "#" },
    ],
  };

  return (
    <div>
      <BreadcrumbComponent paths={breadcrumbPaths[tabs]} />

      <Tabs
        key="none"
        radius="none"
        aria-label="Tabs radius"
        selectedKey={tabs}
        onSelectionChange={(key) => setTabs(key as TabKeys)}
      >
        <Tab key="employees" title="Employees" />
        <Tab key="suspend" title="Suspend" />
        <Tab key="resign" title="Resign" />
        <Tab key="appraisal" title="Appraisal" />
      </Tabs>
    </div>
  );
};

export default Page;