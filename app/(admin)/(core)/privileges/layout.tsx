"use client";
import { ReactNode } from "react";
import NavigationTabs, { TabItem } from "@/components/common/tabs/NavigationTabs";

function RootLayout({ children }: { children: ReactNode }) {
  const tabs : TabItem[] = [
    {
      key: "accessibility",
      title: "Accessibility",
      path: "accessibility"
    },
  ]

  return (
    <NavigationTabs tabs={tabs} basePath="privileges">{children}</NavigationTabs>
  );
}

export default RootLayout;

