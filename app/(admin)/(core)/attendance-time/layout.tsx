"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; // Updated import
import { Tabs, Tab } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/scroll-shadow";

function RootLayout({ children }: { children: ReactNode }) {
  const router = useRouter(); // Use the router from next/navigation
  const pathname = usePathname();
  const activeTab = pathname.includes("overtime")
    ? "overtime"
    : pathname.includes("schedule")
    ? "schedule"
    : "records";
  const handleTabChange = (key: string) => {
    router.push(`/attendance-time/${key}`); // Use router.push for navigation
  };

  const tabs : TabItem[] = {
    
  }

  return (
    <div className="flex flex-col -mt-2">
      <Tabs
        aria-label="Attendance and Time"
        disableAnimation
        selectedKey={activeTab}
        onSelectionChange={(key) => handleTabChange(key as string)}
      >
        <Tab key="records" title="Records" />
        <Tab key="schedule" title="Work Schedule" />
        {/* <Tab key="overtime" title="Overtime" /> */}
      </Tabs>
      <ScrollShadow>{children}</ScrollShadow>
    </div>
  );
}

export default RootLayout;
