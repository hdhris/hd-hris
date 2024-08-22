"use client";
import React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

type BreadcrumbPath = { title: string; link: string };

interface BreadcrumbProps {
  paths: BreadcrumbPath[];
}

const BreadcrumbComponent: React.FC<BreadcrumbProps> = ({ paths }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((crumb, index) => (
          <React.Fragment key={index}>
            {index < paths.length - 1 ? (
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
  );
};

export default BreadcrumbComponent;