"use client";
import { ReactNode } from "react";
import NavigationTabs, { TabItem } from "@/components/common/tabs/NavigationTabs";

function RootLayout({ children }: { children: ReactNode }) {
  const tabs : TabItem[] = [
    {
      key: "earnings",
      title: "Earnings",
      path: "earnings"
    },
    {
      key: "deductions",
      title: "Deductions",
      path: "deductions"
    },
    {
      key: "advance",
      title: "Cash Advance",
      path: "advance"
    },
    {
      key: "process",
      title: "Payroll Process",
      path: "process"
    },
    {
      key: "payslip",
      title: "Pay slip",
      path: "payslip"
    }
  ]

  return (
    <NavigationTabs tabs={tabs} basePath="payroll">{children}</NavigationTabs>
  );
}

export default RootLayout;

