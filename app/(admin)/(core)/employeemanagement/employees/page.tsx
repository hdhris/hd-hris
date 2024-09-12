"use client";

import React, { useEffect, useState } from "react";
import TableData from "@/components/tabledata/TableData";
import { Avatar } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import { TableConfigProps } from "@/types/table/TableDataTypes";

const Page = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employeemanagement/employees");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched employee data:", data);
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
    console.log("Edit employee with id:", id);
    await fetchEmployees();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `/api/employeemanagement/employees?id=${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }
      await fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const config: TableConfigProps<any> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "email", name: "Email", sortable: true },
      { uid: "contact_no", name: "Contact", sortable: false },
      { uid: "actions", name: "Actions", sortable: false },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center">
              <Avatar
                src={item.picture || ''}
                alt={`${item.first_name} ${item.last_name}`}
                className="w-10 h-10 rounded-full mr-10"
              />
              <span>
                {item.first_name} {item.last_name}
              </span>
            </div>
          );
        case "email":
          return <span>{item.email || 'N/A'}</span>;
        case "contact_no":
          return <span>{item.contact_no || 'N/A'}</span>;
        case "actions":
          return (
            <TableActionButton
              name={`${item.first_name} ${item.last_name}`}
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          );
        default:
          return <></>;
      }
    },
  };

  const searchingItemKey = ["first_name", "last_name", "email", "contact_no"];

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
        className="min-h-45"
      />
    </div>
  );
};

export default Page;