"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; // Updated import
import { Tabs, Tab } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/scroll-shadow";

function RootLayout({ children }: { children: ReactNode }) {
  const router = useRouter(); // Use the router from next/navigation
  const pathname = usePathname();
  const activeTab = pathname.includes("earnings")
    ? "earnings"
    : pathname.includes("deductions")
    ? "deductions"
    : pathname.includes("advance")
    ? "advance"
    : pathname.includes("process")
    ? "process"
    : "payslip"
  const handleTabChange = (key: string) => {
    router.push(`/payroll/${key}`); // Use router.push for navigation
  };

  return (
    <div className="flex flex-col -mt-2">
      <Tabs
        aria-label="Payroll"
        disableAnimation
        selectedKey={activeTab}
        onSelectionChange={(key) => handleTabChange(key as string)}
      >
        <Tab key="earnings" title="Earnings" />
        <Tab key="deductions" title="Deductions" />
        <Tab key="advance" title="Cash Advance" />
        <Tab key="process" title="Payroll Process" />
        <Tab key="payslip" title="Pay slip" />
      </Tabs>
      <ScrollShadow>{children}</ScrollShadow>
    </div>
  );
}

export default RootLayout;
