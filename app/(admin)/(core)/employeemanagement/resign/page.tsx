"use client";
import React, { useState, useCallback, useMemo } from "react";
import { useResignedTerminatedEmployees } from "@/services/queries";
import { Employee } from "@/types/employeee/EmployeeType";
import { Avatar, Chip, Button, Spinner } from "@nextui-org/react";
import ViewEmployee from "@/components/admin/employeescomponent/view/ViewEmployee";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import dayjs from "dayjs";
import Text from "@/components/Text";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import showDialog from "@/lib/utils/confirmDialog";

const LoadingAndEmptyState: React.FC<{
  isLoading: boolean;
  isEmpty: boolean;
}> = ({ isLoading, isEmpty }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Spinner>Loading...</Spinner>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
        <Text className="text-lg font-medium">No former employees found</Text>
        <Text className="text-sm mt-2">
          When employees resign or are terminated, they will appear here
        </Text>
      </div>
    );
  }

  return null;
};

const Page: React.FC = () => {
  const {
    data: resignedTerminatedEmployees = [],
    mutate,
    isLoading,
  } = useResignedTerminatedEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isActivating, setIsActivating] = useState<number | null>(null);

  const handleEmployeeUpdated = useCallback(async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating employee data:", error);
    }
  }, [mutate]);

  const handleActivate = useCallback(async (employee: Employee) => {
    try {
      const status = employee.termination_json ? "terminated" : "resigned";
      const result = await showDialog({
        title: "Confirm Reactivation",
        message: `Are you sure you want to reactivate ${employee.first_name} ${employee.last_name}?`,
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
            description: "Employee reactivated successfully",
            variant: "success",
            duration: 3000,
          });
          await mutate();
        }
      }
    } catch (error) {
      console.error("Error activating employee:", error);
      toast({
        title: "Error",
        description: "Failed to reactivate employee. Please try again.",
        variant: "danger",
        duration: 5000,
      });
    } finally {
      setIsActivating(null);
    }
  }, [mutate]);

  const handleRowClick = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  }, []);

  const getEmployeeStatus = useCallback((employee: Employee) => {
    if (employee.termination_json) {
      const terminationData =
        typeof employee.termination_json === "string"
          ? JSON.parse(employee.termination_json)
          : employee.termination_json;

      return {
        type: "Terminated",
        date: terminationData.terminationDate,
        reason: terminationData.reason || terminationData.terminationReason,
        color: "danger" as const,
      };
    } else if (employee.resignation_json) {
      const resignationData =
        typeof employee.resignation_json === "string"
          ? JSON.parse(employee.resignation_json)
          : employee.resignation_json;

      return {
        type: "Resigned",
        date: resignationData.resignationDate,
        reason: resignationData.reason || resignationData.resignationReason,
        color: "default" as const,
      };
    }

    return {
      type: "Unknown",
      date: "",
      reason: "N/A",
      color: "default" as const,
    };
  }, []);

  const TableConfigurations = useMemo(() => ({
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "department", name: "Department", sortable: true },
      { uid: "position", name: "Position", sortable: true },
      { uid: "type", name: "Type", sortable: true },
      { uid: "date", name: "Date", sortable: true },
      { uid: "reason", name: "Reason" },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (employee: Employee, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;
      const cellClasses = "cursor-pointer hover:bg-gray-50";
      const status = getEmployeeStatus(employee);

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
        case "type":
          return (
            <div className={cellClasses} onClick={() => handleRowClick(employee)}>
              <Chip color={status.color} size="sm" variant="flat">
                {status.type}
              </Chip>
            </div>
          );
        case "date":
          return (
            <div className={cellClasses} onClick={() => handleRowClick(employee)}>
              {status.date ? dayjs(status.date).format("MMM DD, YYYY") : "N/A"}
            </div>
          );
        case "reason":
          return (
            <div
              className={`${cellClasses} max-w-md truncate`}
              onClick={() => handleRowClick(employee)}
            >
              {status.reason || "N/A"}
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
                Reactivate
              </Button>
            </div>
          );
        default:
          return <div>-</div>;
      }
    },
  }), [handleRowClick, handleActivate, isActivating, getEmployeeStatus]);

  const sortProps = useMemo(() => ({
    sortItems: [
      { name: "First Name", key: "first_name" as keyof Employee },
      { name: "Last Name", key: "last_name" as keyof Employee },
      { name: "Department", key: "department" as keyof Employee },
      { name: "Date", key: "updated_at" as keyof Employee },
    ],
  }), []);

  const FilterItems = useMemo(() => [
    {
      category: "Department",
      filtered: resignedTerminatedEmployees?.length
        ? Array.from(
            new Set(resignedTerminatedEmployees.map((e) => e.ref_departments?.name))
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
      category: "Type",
      filtered: [
        { key: "type", value: "Resigned", name: "Resigned", uid: "resigned" },
        {
          key: "type",
          value: "Terminated",
          name: "Terminated",
          uid: "terminated",
        },
      ],
    },
  ], [resignedTerminatedEmployees]);

  const renderListDisplay = useCallback((employee: Employee) => {
    const status = getEmployeeStatus(employee);

    return (
      <div className="w-full cursor-pointer" onClick={() => handleRowClick(employee)}>
        <BorderCard className="p-4">
          <div className="flex items-center justify-between">
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
                <span className="text-xs text-gray-500">
                  Date: {status.date ? dayjs(status.date).format("MMM DD, YYYY") : "N/A"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Chip color={status.color} size="sm">
                {status.type}
              </Chip>
              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="flat"
                  color="success"
                  isLoading={isActivating === employee.id}
                  onPress={() => handleActivate(employee)}
                >
                  Reactivate
                </Button>
              </div>
            </div>
          </div>
        </BorderCard>
      </div>
    );
  }, [handleRowClick, handleActivate, isActivating, getEmployeeStatus]);

  if (isLoading || !resignedTerminatedEmployees?.length) {
    return (
      <LoadingAndEmptyState 
        isLoading={isLoading} 
        isEmpty={!resignedTerminatedEmployees?.length} 
      />
    );
  }

  return (
    <div className="h-[calc(100vh-150px)] overflow-hidden">
      <DataDisplay
        defaultDisplay="table"
        title="Former Employees"
        data={resignedTerminatedEmployees}
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
          data_length: resignedTerminatedEmployees?.length || 0,
        }}
        searchProps={{
          searchingItemKey: ["first_name", "last_name"],
        }}
        sortProps={sortProps}
        onListDisplay={renderListDisplay}
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
          sortedEmployees={resignedTerminatedEmployees}
        />
      )}
    </div>
  );
};

export default Page;