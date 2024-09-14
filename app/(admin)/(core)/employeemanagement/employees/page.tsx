"use client";
import React, { useEffect, useState, useCallback } from "react";
import TableData from "@/components/tabledata/TableData";
import { Avatar } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import AddEmployee from "@/components/admin/add/AddEmployees";
import EditEmployee from "@/components/admin/edit/EditEmployee";

interface Employee {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  birthdate: string;
  addr_region: string;
  addr_province: string;
  addr_municipal: string;
  addr_baranggay: string;
  elementary: string;
  highSchool: string;
  seniorHighSchool: string;
  seniorHighStrand: string;
  universityCollege: string;
  course: string;
  highestDegree: string;
  certificates: Array<{ name: string; url: string }>;
  hired_at: string;
  department_id: string;
  job_id: string;
  workSchedules: Record<string, unknown>;
  email: string;
  contact_no: string;
  picture: string;
}

const Page: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleEdit = async (employee: Employee) => {
    try {
      setSelectedEmployeeId(employee.id);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employee details. Please try again.",
        duration: 3000,
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/employeemanagement/employees?id=${id}`);
      setDeleteSuccess(true);
      await fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (!loading && deleteSuccess) {
      toast({
        title: "Success",
        description: "Employee successfully deleted!",
        duration: 3000,
      });
      setDeleteSuccess(false);
    }
  }, [loading, deleteSuccess]);

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
              onEdit={() => handleEdit(item)}
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
      <TableData
        aria-label="Employee Table"
        config={config}
        items={employees}
        searchingItemKey={searchingItemKey}
        counterName="Employees"
        selectionMode="multiple"
        isLoading={loading}
        isHeaderSticky={true}
        classNames={{
          wrapper: "h-[27rem] overflow-y-auto",
        }}
        contentTop={
          <div className="flex items-center justify-between">
            <div className="ml-4">
              <AddEmployee onEmployeeAdded={fetchEmployees} />
            </div>
            <div className="ml-auto mr-4"></div>
          </div>
        }
      />

      {selectedEmployeeId !== null && (
        <EditEmployee
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          employeeId={selectedEmployeeId}
          onEmployeeUpdated={fetchEmployees}
        />
      )}
    </div>
  );
};

export default Page;