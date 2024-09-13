"use client";
import React, { useEffect, useState, useCallback } from "react";
import TableData from "@/components/tabledata/TableData";
import { Avatar } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import AddEmployee from "@/components/admin/add/AddEmployees";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  picture: string;
}

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/employeemanagement/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employees. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleEdit = async (id: number) => {
    console.log("Edit employee with id:", id);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/employeemanagement/employees?id=${id}`);
      toast({
        title: "Success",
        description: "Employee successfully deleted!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const config: TableConfigProps<Employee> = {
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
                src={item.picture || ""}
                alt={`${item.first_name} ${item.last_name}`}
                className="w-10 h-10 rounded-full mr-10"
              />
              <span>
                {item.first_name} {item.last_name}
              </span>
            </div>
          );
        case "email":
          return <span>{item.email || "N/A"}</span>;
        case "contact_no":
          return <span>{item.contact_no || "N/A"}</span>;
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

  const searchingItemKey: (keyof Employee)[] = [
    "first_name",
    "last_name",
    "email",
    "contact_no",
  ];

  return (
    <div id="employee-page" className="mt-2">
      <div className="flex justify-end mb-4">
        <AddEmployee onEmployeeAdded={fetchEmployees} />
      </div>
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

export default EmployeesPage;
