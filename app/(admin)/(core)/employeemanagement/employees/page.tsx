"use client";
import React, { useEffect, useState } from "react";
import { useEmployeesData } from "@/services/queries";
import { Employee } from "@/types/employeee/EmployeeType";
import { Avatar, Chip } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import AddEmployee from "@/components/admin/add/AddEmployees";
import EditEmployee from "@/components/admin/edit/EditEmployee";
import ViewEmployee from "@/components/admin/add/ViewEmployee";
import axios from "axios";
import showDialog from "@/lib/utils/confirmDialog";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import dayjs from "dayjs";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";

const Page: React.FC = () => {
  const { data: employees, mutate, error, isLoading } = useEmployeesData();
  const [sortedEmployees, setSortedEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] =
    React.useState<Employee | null>(null);

  useEffect(() => {
    if (employees) {
      const sorted = sortEmployeesByRecentActivity(employees);
      setSortedEmployees(sorted);
    }
  }, [employees]);

  const sortEmployeesByRecentActivity = (employees: Employee[]) => {
    return [...employees].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployeeId(employee);
    setIsEditModalOpen(true);
  };

  SetNavEndContent(() => (
    <div className="flex items-center gap-4">
      <AddEmployee onEmployeeAdded={handleEmployeeUpdated} />
    </div>
  ));

  const handleDelete = async (id: number, name: string) => {
    try {
      const result = await showDialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete '${name}' ?`,
      });
      if (result === "yes") {
        await axios.delete(`/api/employeemanagement/employees?id=${id}`);
        toast({
          title: "Deleted",
          description: "Employee deleted successfully!",
          variant: "warning",
        });
        await mutate();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error: " + error,
        variant: "danger",
      });
    }
  };

  const handleEmployeeUpdated = async () => {
    try {
      // First, manually call mutate to get fresh data
      const updatedData = await mutate();

      // Then update the sorted employees with the fresh data
      if (updatedData) {
        const sorted = sortEmployeesByRecentActivity(updatedData);
        setSortedEmployees(sorted);
      }
    } catch (error) {
      console.error("Error updating employee data:", error);
    }
  };

  const getEmployeeStatus = (employee: Employee): string => {
    if (employee.termination_json) return "Terminated";
    if (employee.resignation_json) return "Resigned";
    if (employee.suspension_json) return "Suspended";
    return "Active";
  };

  const handleRowClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "department", name: "Department", sortable: true },
      { uid: "position", name: "Position", sortable: true },
      { uid: "contact", name: "Contact" },
      { uid: "hiredate", name: "Hired Date", sortable: true },
      { uid: "status", name: "Status", sortable: true },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (employee: Employee, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;

      // Common styles for clickable cells
      const cellClasses = "cursor-pointer hover:bg-gray-50";

      switch (key) {
        case "name":
          return (
            <div
              className={`flex items-center gap-4 ${cellClasses}`}
              onClick={() => handleRowClick(employee)}
            >
              <Avatar
                src={employee.picture || ""}
                alt={`${employee.first_name} ${employee.last_name}`}
              />
              <span>
                {employee.first_name} {employee.last_name}
                {employee.suffix ? `, ${employee.suffix}` : ""}
                {employee.extension ? ` ${employee.extension}` : ""}
              </span>
            </div>
          );
        case "department":
          return (
            <div
              className={cellClasses}
              onClick={() => handleRowClick(employee)}
            >
              {employee.ref_departments?.name || "N/A"}
            </div>
          );
        case "position":
          return (
            <div
              className={cellClasses}
              onClick={() => handleRowClick(employee)}
            >
              {employee.ref_job_classes?.name || "N/A"}
            </div>
          );
        case "contact":
          return (
            <div
              className={`flex flex-col ${cellClasses}`}
              onClick={() => handleRowClick(employee)}
            >
              <span>{employee.email || "N/A"}</span>
              <span>+63{employee.contact_no || "N/A"}</span>
            </div>
          );
        case "hiredate":
          return (
            <div
              className={cellClasses}
              onClick={() => handleRowClick(employee)}
            >
              {employee.hired_at
                ? dayjs(employee.hired_at).format("MMM DD, YYYY")
                : "N/A"}
            </div>
          );
        case "status":
          const status = getEmployeeStatus(employee);
          const statusColor = {
            Active: "success",
            Terminated: "danger",
            Resigned: "default",
            Suspended: "warning",
          }[status] as "success" | "danger" | "warning" | "default";

          return (
            <div
              className={cellClasses}
              onClick={() => handleRowClick(employee)}
            >
              <Chip color={statusColor} size="sm" variant="flat">
                {status}
              </Chip>
            </div>
          );
        case "actions":
          return (
            <TableActionButton
              name={`${employee.first_name} ${employee.last_name}`}
              onEdit={() => handleEdit(employee)}
              onDelete={() =>
                handleDelete(
                  employee.id,
                  `${employee.first_name} ${employee.last_name}`
                )
              }
            />
          );
        default:
          return <div>-</div>;
      }
    },
  };

  const sortProps = {
    sortItems: [
      { name: "First Name", key: "first_name" as keyof Employee },
      { name: "Last Name", key: "last_name" as keyof Employee },
      { name: "Created At", key: "created_at" as keyof Employee },
      { name: "Updated At", key: "updated_at" as keyof Employee },
      { name: "Hired Date", key: "hired_at" as keyof Employee },
    ],
  };

  const FilterItems = [
    {
      category: "Department",
      filtered: sortedEmployees
        ? Array.from(new Set(sortedEmployees.map((e) => e.ref_departments?.name)))
            .filter(Boolean) // Remove undefined values
            .map((dept) => ({
              key: "ref_departments.name",
              value: dept || "", // Default to empty string if undefined
              name: dept || "",
              uid: dept || "",
            }))
        : [],
    },
  ];
  

  return (
    <div className="h-[calc(100vh-150px)] overflow-hidden">
      <DataDisplay
        defaultDisplay="table"
        title="Employees"
        
        data={sortedEmployees}
        filterProps={{
          filterItems: FilterItems,
        }}
        isLoading={isLoading}
        onTableDisplay={{
          config: TableConfigurations,
          className: "h-full overflow-auto",
                    layout: "auto",
        }}
        paginationProps={{
          data_length: sortedEmployees?.length
        }}
        
        searchProps={{
          searchingItemKey: ["first_name", "last_name", "email", "contact_no"],
        }}
        sortProps={sortProps}
        onListDisplay={(employee) => (
          <div
            className="w-full cursor-pointer"
            onClick={() => handleRowClick(employee)}
          >
            <BorderCard className="p-4">
              <div className="flex items-center gap-4">
                <Avatar
                  src={employee.picture || ""}
                  alt={`${employee.first_name} ${employee.last_name}`}
                />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {employee.ref_departments?.name || "N/A"} -{" "}
                    {employee.ref_job_classes?.name || "N/A"}
                  </span>
                </div>
              </div>
            </BorderCard>
          </div>
        )}

        onExport={{
          drawerProps: {
              title: "Export",
          }
      }}
      onImport={{
          drawerProps: {
              title: "Import",
          }
        }}
        
      />

      {selectedEmployee && (
        <ViewEmployee
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}

      {selectedEmployeeId && (
        <EditEmployee
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEmployeeId(null);
          }}
          employeeData={selectedEmployeeId}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}
    </div>
  );
};

export default Page;
