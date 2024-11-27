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
import {
  // ExtendedTableActionButton,
  TableActionButton,
} from "@/components/actions/ActionButton";

const Page: React.FC = () => {
  const { data: employees, mutate, isLoading } = useEmployeesData();
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isActivating, setIsActivating] = useState<number | null>(null);

  useEffect(() => {
    if (employees) {
      const filtered = employees
        .filter((employee) => {
          return (employee.resignation_json && employee.deleted_at) || (employee.termination_json && employee.deleted_at);
        })
        .sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at).getTime();
          const dateB = new Date(b.updated_at || b.created_at).getTime();
          return dateB - dateA;
        });
        console.log(filtered)
      setFilteredEmployees(filtered);
    }
  }, [employees]);

  const handleEmployeeUpdated = async () => {
    try {
      const updatedData = await mutate();
      if (updatedData) {
        const filtered = updatedData
          .filter((employee) => {
            return employee.resignation_json || employee.termination_json;
          })
          .sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at).getTime();
            const dateB = new Date(b.updated_at || b.created_at).getTime();
            return dateB - dateA;
          });
        setFilteredEmployees(filtered);
      }
    } catch (error) {
      console.error("Error updating employee data:", error);
    }
  };

  const handleActivate = async (employee: Employee) => {
    try {
      const result = await showDialog({
        title: "Confirm Activation",
        message: `Are you sure you want to activate ${employee.first_name} ${employee.last_name}?`,
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

  const handleRowClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const getEmployeeStatus = (
    employee: Employee
  ): {
    type: string;
    date: string;
    reason: string;
    color: "danger" | "default";
  } => {
    if (employee.termination_json) {
      const terminationData =
        typeof employee.termination_json === "string"
          ? JSON.parse(employee.termination_json)
          : employee.termination_json;

      return {
        type: "Terminated",
        date: terminationData.terminationDate,
        reason: terminationData.reason || terminationData.terminationReason,
        color: "danger",
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
        color: "default",
      };
    }

    return {
      type: "Unknown",
      date: "",
      reason: "N/A",
      color: "default",
    };
  };

  const TableConfigurations = {
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
        case "type":
          return (
            <div
              className={cellClasses}
              onClick={() => handleRowClick(employee)}
            >
              <Chip color={status.color} size="sm" variant="flat">
                {status.type}
              </Chip>
            </div>
          );
        case "date":
          return (
            <div
              className={cellClasses}
              onClick={() => handleRowClick(employee)}
            >
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
            <div
              className="flex items-center gap-2 justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="sm"
                variant="flat"
                color="success"
                isLoading={isActivating === employee.id}
                onPress={() => handleActivate(employee)}
              >
                Activate
              </Button>
              <TableActionButton
                name={`${employee.first_name} ${employee.last_name}`}
                onDelete={() =>
                  handleDelete(
                    employee.id,
                    `${employee.first_name} ${employee.last_name}`
                  )
                }
              />
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
      { name: "Department", key: "department" as keyof Employee },
      { name: "Date", key: "updated_at" as keyof Employee },
    ],
  };

  const FilterItems = [
    {
      category: "Department",
      filtered: filteredEmployees
        ? Array.from(
            new Set(filteredEmployees.map((e) => e.ref_departments?.name))
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
  ];

  return (
    <div className="h-[calc(100vh-150px)] overflow-hidden">
      <DataDisplay
        defaultDisplay="table"
        title="Former Employees"
        data={filteredEmployees}
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
          data_length: filteredEmployees?.length,
        }}
        searchProps={{
          searchingItemKey: ["first_name", "last_name"],
        }}
        sortProps={sortProps}
        onListDisplay={(employee) => {
          const status = getEmployeeStatus(employee);

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
                        Date:{" "}
                        {status.date
                          ? dayjs(status.date).format("MMM DD, YYYY")
                          : "N/A"}
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
          sortedEmployees={filteredEmployees}
        />
      )}
    </div>
  );
};

export default Page;