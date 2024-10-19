"use client";
import { ReactNode } from "react";
import NavigationTabs, { TabItem } from "@/components/common/tabs/NavigationTabs";

function RootLayout({ children }: { children: ReactNode }) {
  const tabs : TabItem[] = [
    {
      key: "records",
      title: "Records",
      path: "records"
    },
    {
      key: "schedule",
      title: "Work Schedule",
      path: "schedule"
    },
    {
      key: "overtime",
      title: "Overtime",
      path: "overtime"
    },
    {
      key: "holidays",
      title: "Holidays",
      path: "holidays"
    }
  ]

  return (
    <NavigationTabs tabs={tabs} basePath="attendance-time">{children}</NavigationTabs>
  );
}

export default RootLayout;
