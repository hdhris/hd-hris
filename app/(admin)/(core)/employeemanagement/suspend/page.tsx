"use client";
import React, { useEffect, useState } from "react";
import { useEmployeesData } from "@/services/queries";
import { Employee } from "@/types/employeee/EmployeeType";
import { Avatar, Chip, Button } from "@nextui-org/react";
import { toast } from "@/components/ui/use-toast";
import ViewEmployee from "@/components/admin/employeescomponent/view/ViewEmployee";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import dayjs from "dayjs";
import axios from "axios";
import showDialog from "@/lib/utils/confirmDialog";

const Page: React.FC = () => {
  const { data: employees, mutate, isLoading } = useEmployeesData();
  const [suspendedEmployees, setSuspendedEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isActivating, setIsActivating] = useState<number | null>(null);

  useEffect(() => {
    if (employees) {
      const filtered = employees
        .filter((employee) => {
          return (
            employee.suspension_json &&
            !employee.resignation_json &&
            !employee.termination_json
          );
        })
        .sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at).getTime();
          const dateB = new Date(b.updated_at || b.created_at).getTime();
          return dateB - dateA;
        });
      setSuspendedEmployees(filtered);
    }
  }, [employees]);

  const handleEmployeeUpdated = async () => {
    try {
      const updatedData = await mutate();
      if (updatedData) {
        const filtered = updatedData
          .filter((employee) => {
            return (
              employee.suspension_json &&
              !employee.resignation_json &&
              !employee.termination_json
            );
          })
          .sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at).getTime();
            const dateB = new Date(b.updated_at || b.created_at).getTime();
            return dateB - dateA;
          });
        setSuspendedEmployees(filtered);
      }
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
          await mutate(); // Refresh the data
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
    setIsViewModalOpen(true);
  };

  const calculateDuration = (startDate: string, endDate: string): string => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const days = end.diff(start, "day");
    return `${days} days`;
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "department", name: "Department", sortable: true },
      { uid: "position", name: "Position", sortable: true },
      { uid: "duration", name: "Duration", sortable: true },
      { uid: "suspendedDate", name: "Suspended Date", sortable: true },
      { uid: "endDate", name: "End Date", sortable: true },
      { uid: "reason", name: "Suspended Reason" },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (employee: Employee, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;
      const cellClasses = "cursor-pointer hover:bg-gray-50";
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
        case "duration":
          return (
            <div
              className={cellClasses}
              onClick={() => handleRowClick(employee)}
            >
              {suspensionData
                ? calculateDuration(
                    suspensionData.startDate,
                    suspensionData.endDate
                  )
                : "N/A"}
            </div>
          );
        case "suspendedDate":
          return (
            <div
              className={cellClasses}
              onClick={() => handleRowClick(employee)}
            >
              {suspensionData
                ? dayjs(suspensionData.startDate).format("MMM DD, YYYY")
                : "N/A"}
            </div>
          );
        case "endDate":
          return (
            <div
              className={cellClasses}
              onClick={() => handleRowClick(employee)}
            >
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

  const sortProps = {
    sortItems: [
      { name: "First Name", key: "first_name" as keyof Employee },
      { name: "Last Name", key: "last_name" as keyof Employee },
      { name: "Suspended Date", key: "suspension_json" as keyof Employee },
    ],
  };

  const FilterItems = [
    {
      category: "Department",
      filtered: suspendedEmployees
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

  return (
    <div className="h-[calc(100vh-150px)] overflow-hidden">
      <DataDisplay
        defaultDisplay="table"
        title="Suspended Employees"
        data={suspendedEmployees}
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
          data_length: suspendedEmployees?.length,
        }}
        searchProps={{
          searchingItemKey: ["first_name", "last_name"],
        }}
        sortProps={sortProps}
        onListDisplay={(employee) => {
          const suspensionData =
            employee.suspension_json &&
            (typeof employee.suspension_json === "string"
              ? JSON.parse(employee.suspension_json)
              : employee.suspension_json);

          return (
            <div
              className="w-full cursor-pointer"
              onClick={() => handleRowClick(employee)}
            >
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
                        Duration:{" "}
                        {suspensionData
                          ? calculateDuration(
                              suspensionData.startDate,
                              suspensionData.endDate
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Chip color="warning" size="sm">
                      Suspended
                    </Chip>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="flat"
                        color="success"
                        isLoading={isActivating === employee.id}
                        onPress={() => handleActivate(employee)}
                      >
                        Activate
                      </Button>
                    </div>
                  </div>
                </div>
              </BorderCard>
            </div>
          );
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
          sortedEmployees={suspendedEmployees}
        />
      )}
    </div>
  );
};

export default Page;
