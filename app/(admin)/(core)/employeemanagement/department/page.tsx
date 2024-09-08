"use client";
import React, { useEffect, useState } from 'react';
import TableData from '@/components/tabledata/TableData';
import { TableActionButton } from '@/components/actions/ActionButton';
import { DepartmentInfo } from "@/types/employeee/DepartmentType";
import { Avatar } from "@nextui-org/react";
import { useRouter } from 'next/navigation';
import { TableConfigProps } from "@/types/table/TableDataTypes";

const Page = () => {
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/employeemanagement/department"); // Adjust the endpoint as per your API route
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: DepartmentInfo[] = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const config: TableConfigProps<DepartmentInfo> = {
    columns: [
      { uid: 'name', name: 'Name', sortable: true },
      { uid: 'department_dean', name: 'Department Dean', sortable: false },
      { uid: 'department_head', name: 'Department Head', sortable: false },
      { uid: 'no_of_employees', name: 'No. of Employees', sortable: true },
      { uid: 'no_of_resign', name: 'No. of Resigned', sortable: true },
      { uid: 'logo', name: 'Logo', sortable: false },
      { uid: 'actions', name: 'Actions', sortable: false },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case 'name':
          return <span>{item.department}</span>;
        case 'department_dean':
          return <span>{item.heads?.fullName || 'N/A'}</span>;
        case 'department_head':
          return <span>{item.heads?.fullName || 'N/A'}</span>;
        case 'no_of_employees':
          return <span>{item.total_employees}</span>;
        case 'no_of_resign':
          return <span>{item.resignedEmployees || 0}</span>;
        case 'logo':
          return (
            <div className="w-10 h-10">
              <Avatar
                src={item.heads?.picture || "/images/default_avatar.png"}
                className="w-full h-full rounded-full"
              />
            </div>
          );
        case 'actions':
          return (
            <TableActionButton
              name={item.department}
              onEdit={() => router.push(`/employeemanagement/departments/${item.id}/edit`)}
              onDelete={() => alert(`Delete department: ${item.department}`)}
            />
          );
        default:
          return <span>—</span>; // Default fallback
      }
    },
  };

  const searchingItemKey: Array<keyof DepartmentInfo> = [
    "department",
  ];

  return (
    <div className="mt-2">
      <TableData
        aria-label="Department Table"
        config={config}
        items={departments}
        searchingItemKey={searchingItemKey}
        counterName="Departments"
        selectionMode="multiple"
        isLoading={loading}
        classNames={{
          wrapper: "h-[27rem]",
        }}
        className="min-h-52"
      />
    </div>
  );
};

export default Page;
