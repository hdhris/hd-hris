import { ReactNode } from "react";
import NavigationTabs, {
  TabItem,
} from "@/components/common/tabs/NavigationTabs";

function RootLayout({ children }: { children: ReactNode }) {
  const tabs: TabItem[] = [
    {
      key: "empprograms",
      title: "Training Program",
      path: "empprograms",
    },
    {
      key: "allseminars",
      title: "Seminar",
      path: "allseminars",
    },
    {
      key: "emprecords",
      title: "Employee records",
      path: "emprecords",
    },
  ];

  return (
    <NavigationTabs tabs={tabs} basePath="trainings-and-seminars">
      {children}
    </NavigationTabs>
  );
}

export default RootLayout;
