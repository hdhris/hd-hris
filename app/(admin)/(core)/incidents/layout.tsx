"use client";
import { ReactNode } from "react";
import NavigationTabs, { TabItem } from "@/components/common/tabs/NavigationTabs";

function RootLayout({ children }: { children: ReactNode }) {
  const tabs : TabItem[] = [
    {
      key: "report",
      title: "Report",
      path: "report"
    },
  ]

  return (
    <NavigationTabs tabs={tabs} basePath="payroll">{children}</NavigationTabs>
  );
}

export default RootLayout;

