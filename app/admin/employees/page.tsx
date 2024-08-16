"use client";
import React, { useState } from "react";

import { Tabs, Tab } from "@nextui-org/react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";



// Define the possible keys as a union type
type TabKeys = "employees" | "suspend" | "resign" | "appraisal";

const Page = () => {
  const [tabs, setTabs] = useState<TabKeys>("employees");

  // Define the breadcrumb paths based on the selected tab
  const breadcrumbPaths: Record<TabKeys, { title: string; link: string }[]> = {
    empl  oyees: [{ title: "Employees", link: "#" }],
    suspend: [
      { title: "Employees", link: "#" },
      { title: "Suspend", link: "#" },
    ],
    resign: [
      { title: "Employees", link: "#" },
      { title: "Suspend", link: "#" },
      { title: "Resign", link: "#" },
    ],
    appraisal: [
      { title: "Employees", link: "#" },
      { title: "Suspend", link: "#" },
      { title: "Resign", link: "#" },
      { title: "Appraisal", link: "#" },
    ],
  };

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbPaths[tabs].map((crumb, index) => (
            <React.Fragment key={index}>
              {index < breadcrumbPaths[tabs].length - 1 ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <Tabs
        key="none"
        radius="none"
        aria-label="Tabs radius"
        selectedKey={tabs}
        onSelectionChange={(key) => setTabs(key as TabKeys)}
      >
        <Tab key="france" title="Employees" />
        <Tab key="suspend" title="Suspend" />
        <Tab key="resign" title="Resign" />
        <Tab key="appraisal" title="Appraisal" />
      </Tabs>
    </div>
  );
};

export default Page;
// "use client"
// import React, { useState } from 'react'

// import {Tabs, Tab} from "@nextui-org/react"; 

// import {
//   Breadcrumb,
//   BreadcrumbEllipsis,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"

 
// const page = () => {
//   const [tabs, setTabs] = useState<string>("")

//   return (
//     <div>
//       <Breadcrumb>
//       <BreadcrumbList>
//         <BreadcrumbItem>

//           <BreadcrumbLink href="/">Employees</BreadcrumbLink>
//         </BreadcrumbItem>
//         <BreadcrumbSeparator />
    
  
//         <BreadcrumbItem>
//           <BreadcrumbLink href="/docs/components">Suspend</BreadcrumbLink>
//         </BreadcrumbItem>

//         <BreadcrumbSeparator />

//         <BreadcrumbItem>
//           <BreadcrumbPage>Resign</BreadcrumbPage>
//         </BreadcrumbItem>
//         <BreadcrumbSeparator />

//         <BreadcrumbItem>
//           <BreadcrumbPage>Appraisal</BreadcrumbPage>
//         </BreadcrumbItem>

//       </BreadcrumbList>
//     </Breadcrumb>

//         <Tabs key={"none"} radius={"none"} aria-label="Tabs radius"  selectedKey={tabs}
//         onSelectionChange={setTabs}>
//           <Tab key="employees" title="Employees"/>
//           <Tab key="suspend" title="Suspend"/>
//           <Tab key="resign" title="Resign"/>
//           <Tab key="appraisal" title="Appraisal"/>
//         </Tabs>
//     </div>
//   )
// }

// export default page