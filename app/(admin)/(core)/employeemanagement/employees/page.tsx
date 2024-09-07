"use client";

import React, { useEffect, useState } from "react";
import TableData from "@/components/tabledata/TableData";
import { Employee } from "@/types/employeee/EmployeeType";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Avatar } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";

const Page = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employeemanagement/employees");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Employee[] = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = async (id: number) => {
    // This is a placeholder. You would typically open a modal or navigate to an edit page.
    console.log("Edit employee with id:", id);
    // After editing, you might want to refetch the employees or update the local state
    await fetchEmployees();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/employeemanagement/employees?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }
      // Refetch employees after successful deletion
      await fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const config: TableConfigProps<Employee> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "department", name: "Department", sortable: true },
      { uid: "position", name: "Position", sortable: true },
      { uid: "contact", name: "Contact", sortable: false },
      { uid: "status", name: "Status", sortable: true },
      { uid: "actions", name: "Actions", sortable: false },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center">
              <Avatar
                src={item.picture}
                alt={item.name}
                className="w-10 h-10 rounded-full mr-2"
              />
              <span>{item.name}</span>
            </div>
          );
        case "department":
          return <span>{item.department}</span>;
        case "position":
          return <span>{item.position}</span>;
        case "contact":
          return (
            <div>
              <div>{item.email}</div>
              <div>{item.phone}</div>
            </div>
          );
        case "status":
          return <span>{item.status}</span>;
        case "actions":
          return (
            <TableActionButton
              name={item.name}
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          );
        default:
          return <></>;
      }
    },
  };

  const searchingItemKey: Array<keyof Employee> = [
    "name",
    "position",
    "department",
    "status",
  ];

  return (
    <div className="mt-2">
      <TableData
        aria-label="Employee Table"
        config={config}
        items={employees}
        searchingItemKey={searchingItemKey}
        counterName="Employees"
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