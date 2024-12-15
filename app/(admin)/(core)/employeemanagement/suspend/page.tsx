"use client";
import React, { useState } from "react";
import { useSuspendedEmployees } from "@/services/queries";
import { Employee } from "@/types/employeee/EmployeeType";
import { Avatar, Chip, Button } from "@nextui-org/react";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import Text from "@/components/Text";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import showDialog from "@/lib/utils/confirmDialog";
import ViewEmployee from "@/components/admin/employeescomponent/view/ViewEmployee";

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)]">
      <div className="text-center space-y-3">
        <Text className="text-xl font-bold text-gray-700">No Suspended Employees Found</Text>
        <Text className="text-gray-500">There are no suspended employees at the moment.</Text>
        <Text className="text-sm text-gray-400">Suspended employees will appear here when their status changes.</Text>
      </div>
    </div>
  );
};

const Page: React.FC = () => {
  const { data: suspendedEmployees, mutate, isLoading } = useSuspendedEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isActivating, setIsActivating] = useState<number | null>(null);

  const handleEmployeeUpdated = async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating employee data:", error);
    }
  };

  const handleActivate = async (employee: Employee) => {
    try {
      const result = await showDialog({
        title: "Confirm Activation",
        message: `Are you sure you want to unsuspend ${employee.first_name} ${employee.last_name}?`,
      });

      if (result === "yes") {
        setIsActivating(employee.id);
        const response = await axios.put(
          `/api/employeemanagement/employees?id=${employee.id}&type=status`,
          {
            status: "active",
          }
        );

        if (response.status === 200) {
          toast({
            title: "Success",
            description: "Employee activated successfully",
            variant: "success",
          });
          await mutate();
        }
      }
    } catch (error) {
      console.error("Error activating employee:", error);
      toast({
        title: "Error",
        description: "Failed to activate employee. Please try again.",
        variant: "danger",
      });
    } finally {
      setIsActivating(null);
    }
  };

  const handleRowClick = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "department", name: "Department", sortable: true },
      { uid: "position", name: "Position", sortable: true },
      { uid: "suspendedDate", name: "Suspended Date", sortable: true },
      { uid: "endDate", name: "End Date", sortable: true },
      { uid: "reason", name: "Suspended Reason" },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (employee: Employee, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;
      const cellClasses = "cursor-pointer";
      const suspensionData =
        employee.suspension_json &&
        (typeof employee.suspension_json === "string"
          ? JSON.parse(employee.suspension_json)
          : employee.suspension_json);

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
            <div className={cellClasses} onClick={() => handleRowClick(employee)}>
              {employee.ref_departments?.name || "N/A"}
            </div>
          );
        case "position":
          return (
            <div className={cellClasses} onClick={() => handleRowClick(employee)}>
              {employee.ref_job_classes?.name || "N/A"}
            </div>
          );
        case "suspendedDate":
          return (
            <div className={cellClasses} onClick={() => handleRowClick(employee)}>
              {suspensionData
                ? dayjs(suspensionData.startDate).format("MMM DD, YYYY")
                : "N/A"}
            </div>
          );
        case "endDate":
          return (
            <div className={cellClasses} onClick={() => handleRowClick(employee)}>
              {suspensionData
                ? dayjs(suspensionData.endDate).format("MMM DD, YYYY")
                : "N/A"}
            </div>
          );
        case "reason":
          return (
            <div
              className={`${cellClasses} max-w-md truncate`}
              onClick={() => handleRowClick(employee)}
            >
              {suspensionData
                ? suspensionData.reason || suspensionData.suspensionReason
                : "N/A"}
            </div>
          );
        case "actions":
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="flat"
                color="success"
                isLoading={isActivating === employee.id}
                onPress={() => handleActivate(employee)}
              >
                Unsuspend
              </Button>
            </div>
          );
        default:
          return <div>-</div>;
      }
    },
  };

  const FilterItems = [
    {
      category: "Department",
      filtered: suspendedEmployees?.length 
        ? Array.from(
            new Set(suspendedEmployees.map((e) => e.ref_departments?.name))
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
  ];

  const sortProps = {
    sortItems: [
      { name: "First Name", key: "first_name" as keyof Employee },
      { name: "Last Name", key: "last_name" as keyof Employee },
      { name: "Suspended Date", key: "suspension_json" as keyof Employee },
    ],
  };

  if (isLoading) {
    return (
      <section className='w-full h-full flex gap-4 overflow-hidden'>
        <DataDisplay
          defaultDisplay="table"
          title="Suspended Employees"
          data={[]}
          isLoading={true}
          onTableDisplay={{
            config: TableConfigurations,
            layout: "auto"
          }}
        />
      </section>
    );
  }

  if (!suspendedEmployees || suspendedEmployees.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className='w-full h-full flex gap-4 overflow-hidden'>
      <DataDisplay
        defaultDisplay="table"
        title="Suspended Employees"
        data={suspendedEmployees}
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
          data_length: suspendedEmployees.length,
        }}
        searchProps={{
          searchingItemKey: ["first_name", "last_name"],
        }}
        sortProps={sortProps}
      />

      {selectedEmployee && (
        <ViewEmployee
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onEmployeeUpdated={handleEmployeeUpdated}
          sortedEmployees={suspendedEmployees}
        />
      )}
    </section>
  );
};

export default Page;
