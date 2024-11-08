"use client";
import { ReactNode } from "react";
import NavigationTabs, { TabItem } from "@/components/common/tabs/NavigationTabs";

function RootLayout({ children }: { children: ReactNode }) {
  const tabs : TabItem[] = [
    // {
    //   key: "membership",
    //   title: "Membership",
    //   path: "membership"
    // },
    {
      key: "plans",
      title: "Plans",
      path: "plans"
    }
  ]

  return (
    <NavigationTabs tabs={tabs} basePath="benefits">{children}</NavigationTabs>
  );
}

export default RootLayout;
