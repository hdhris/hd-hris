"use client";
import React, { useState } from "react";
import { useEmployeesData } from "@/services/queries";
import { Employee } from "@/types/employeee/EmployeeType";
import { Avatar, Chip } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import AddEmployee from "@/components/admin/employeescomponent/store/AddEmployees";
import EditEmployee from "@/components/admin/employeescomponent/update/EditEmployee";
import ViewEmployee from "@/components/admin/employeescomponent/view/ViewEmployee";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import Text from "@/components/Text";
import dayjs from "dayjs";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)]">
      <div className="text-center space-y-3">
        <Text className="text-xl font-bold text-gray-700">No Employees Found</Text>
        <Text className="text-gray-500">There are no active employees at the moment.</Text>
        <Text className="text-sm text-gray-400">Click the &apos;Add Employee&apos; button above to get started.</Text>
      </div>
    </div>
  );
};
const Page: React.FC = () => {
  const { data: employees, mutate, isLoading } = useEmployeesData();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<Employee | null>(null);

  const handleEdit = (employee: Employee) => {
    setSelectedEmployeeId(employee);
    setIsEditModalOpen(true);
  };

  const handleEmployeeUpdated = async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating employee data:", error);
    }
  };

  SetNavEndContent(() => (
    <div className="flex items-center gap-4">
      <AddEmployee onEmployeeAdded={handleEmployeeUpdated} />
    </div>
  ));

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
      { uid: "workstatus", name: "Work Status", sortable: true },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (employee: Employee, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;
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
        case "workstatus":
          return (
            <div
              className={cellClasses}
              onClick={() => handleRowClick(employee)}
            >
              <Chip
                className="capitalize"
                color={employee.is_regular ? "success" : "warning"}
                size="sm"
                variant="flat"
              >
                {employee.is_regular ? "Regular" : "Probitionary"}
              </Chip>
            </div>
          );
        case "actions":
          return (
            <TableActionButton
              name={`${employee.first_name} ${employee.last_name}`}
              onEdit={() => handleEdit(employee)}
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
      { name: "Created", key: "created_at" as keyof Employee },
      { name: "Updated", key: "updated_at" as keyof Employee },
      { name: "Hired Date", key: "hired_at" as keyof Employee },
    ],
  };

  const FilterItems = [
    {
      category: "Work Status",
      filtered: [
        {
          key: "is_regular",
          value: true,
          name: "Regular",
          uid: "probitionary",
        },
        {
          key: "is_regular",
          value: false,
          name: "Probitionary",
          uid: "regular",
        },
      ],
    },
    {
      category: "Department",
      filtered: employees?.length 
        ? Array.from(
            new Set(employees.map((e) => e.ref_departments?.name))
          )
            .filter(Boolean)
            .map((dept) => ({
              key: "ref_departments.name",
              value: dept || "",
              name: dept || "",
              uid: dept || "",
            }))
        : [],
    },
    {
      category: "Job Position",
      filtered: employees?.length
        ? Array.from(
            new Set(employees.map((e) => e.ref_job_classes?.name))
          )
            .filter(Boolean)
            .map((job) => ({
              key: "ref_job_classes.name",
              value: job || "",
              name: job || "",
              uid: job || "",
            }))
        : [],
    },
  ];

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-150px)] overflow-hidden">
        <DataDisplay
          defaultDisplay="table"
          title="Active Employees"
          data={[]}
          isLoading={true}
          onTableDisplay={{
            config: TableConfigurations,
            className: "h-full overflow-auto",
            layout: "auto",
          }}
        />
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-[calc(100vh-150px)] overflow-hidden">
      <DataDisplay
        defaultDisplay="table"
        title="Active Employees"
        data={employees}
        filterProps={{
          filterItems: FilterItems,
        }}
        isLoading={false}
        onTableDisplay={{
          config: TableConfigurations,
          className: "h-full overflow-auto",
          layout: "auto",
        }}
        paginationProps={{
          data_length: employees.length,
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
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
                  <Chip
                    className="capitalize"
                    color={employee.is_regular ? "success" : "warning"}
                    size="sm"
                    variant="flat"
                  >
                    {employee.is_regular ? "Regular" : "Probitionary"}
                  </Chip>
                </div>
              </div>
            </BorderCard>
          </div>
        )}
        onExport={{
          drawerProps: {
            title: "Export",
          },
        }}
        onImport={{
          drawerProps: {
            title: "Import",
          },
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
          sortedEmployees={employees}
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