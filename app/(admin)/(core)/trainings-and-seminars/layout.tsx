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
      key: "empenrolled",
      title: "Enrolled Employees",
      path: "empenrolled",
    },
    {
      key: "schedules",
      title: "Schedules", 
      path: "schedules",
    },
    {
      key: "records",
      title: "Training Records",
      path: "records", 
    }
  ];

  return (
    <NavigationTabs tabs={tabs} basePath="trainings-and-seminars">
      {children}
    </NavigationTabs>
  );
}

export default RootLayout;
