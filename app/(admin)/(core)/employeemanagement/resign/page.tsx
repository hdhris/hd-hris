"use client";
import React, { useMemo, useState } from "react";
import { useResignedTerminatedEmployees } from "@/services/queries";
import { Employee } from "@/types/employeee/EmployeeType";
import { Avatar, Chip, Button } from "@nextui-org/react";
import DataDisplay from "@/components/common/data-display/data-display";
import Text from "@/components/Text";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import showDialog from "@/lib/utils/confirmDialog";
import ViewEmployee from "@/components/admin/employeescomponent/view/ViewEmployee";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)]">
      <div className="text-center space-y-3">
        <Text className="text-xl font-bold text-gray-700">
          No Former Employees Found
        </Text>
        <Text className="text-gray-500">
          There are no resigned or terminated employees at the moment.
        </Text>
        <Text className="text-sm text-gray-400">
          When employees resign or are terminated, they will appear here.
        </Text>
      </div>
    </div>
  );
};

const Page: React.FC = () => {
  const {
    data: resignedTerminatedEmployees,
    mutate,
    isLoading,
  } = useResignedTerminatedEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isActivating, setIsActivating] = useState<number | null>(null);

  type Signatory = {
    id: string | number;
    name: string;
    picture?: string;
    role?: string;
  };

  // Extract signatories for the selected employee
  const signatories = useMemo<Signatory[]>(() => {
    if (!selectedEmployee) return [];

    const statusData = selectedEmployee.termination_json
      ? typeof selectedEmployee.termination_json === "string"
        ? JSON.parse(selectedEmployee.termination_json)
        : selectedEmployee.termination_json
      : typeof selectedEmployee.resignation_json === "string"
      ? JSON.parse(selectedEmployee.resignation_json)
      : selectedEmployee.resignation_json;

    // Extract and transform signatories
    return (
      statusData?.signatories?.users?.map((user: any) => ({
        id: user.id,
        name: user.name,
        picture: user.picture,
        role: user.role,
      })) || []
    );
  }, [selectedEmployee]);

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
          });
          await mutate();
        }
      }
    } catch (error) {
      console.error("Error reactivating employee:", error);
      toast({
        title: "Error",
        description: "Failed to reactivate employee. Please try again.",
        variant: "danger",
      });
    } finally {
      setIsActivating(null);
    }
  };

  const handleOnSelected = (key: React.Key) => {
    const selected = resignedTerminatedEmployees?.find(
      (item) => item.id === Number(key)
    );
    setSelectedEmployee(selected ?? null);
  };

  const getEmployeeStatus = (employee: Employee) => {
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
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "department", name: "Department", sortable: true },
      { uid: "position", name: "Position", sortable: true },
      { uid: "type", name: "Type", sortable: true },
      { uid: "date", name: "Date", sortable: true },
      { uid: "reason", name: "Reason" },
      { uid: "signatories", name: "Approved By", sortable: false },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (employee: Employee, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;
      const statusData = employee.termination_json
        ? typeof employee.termination_json === "string"
          ? JSON.parse(employee.termination_json)
          : employee.termination_json
        : typeof employee.resignation_json === "string"
        ? JSON.parse(employee.resignation_json)
        : employee.resignation_json;
      const status = getEmployeeStatus(employee);

      switch (key) {
        case "name":
          return (
            <div className={`flex items-center gap-4`}>
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
          return <div>{employee.ref_departments?.name || "N/A"}</div>;
        case "position":
          return <div>{employee.ref_job_classes?.name || "N/A"}</div>;
        case "type":
          return (
            <div>
              <Chip color={status.color} size="sm" variant="flat">
                {status.type}
              </Chip>
            </div>
          );
        case "date":
          return (
            <div>
              {status.date ? dayjs(status.date).format("MMM DD, YYYY") : "N/A"}
            </div>
          );
        case "reason":
          return (
            <div className={`max-w-md truncate`}>{status.reason || "N/A"}</div>
          );

        case "signatories":
          const suspensionSignatories: Signatory[] =
            statusData?.signatories?.users?.map((user: any) => ({
              id: user.id,
              name: user.name,
              picture: user.picture,
              role: user.role,
            })) || [];
          return (
            <div className="flex items-center gap-2">
              {suspensionSignatories.map((signatory) => (
                <UserAvatarTooltip
                  key={signatory.id}
                  user={{
                    name: signatory.name,
                    picture: signatory.picture,
                    id: signatory.id,
                  }}
                  avatarProps={{
                    classNames: { base: "!size-6" },
                    isBordered: true,
                  }}
                />
              ))}
              {statusData?.initiatedBy && (
                <UserAvatarTooltip
                  key={statusData.initiatedBy.id}
                  user={{
                    name: statusData.initiatedBy.name,
                    picture: statusData.initiatedBy.picture,
                    id: statusData.initiatedBy.id,
                  }}
                  avatarProps={{
                    classNames: { base: "!size-6" },
                    isBordered: true,
                  }}
                />
              )}
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
  };

  const FilterItems = [
    {
      category: "Department",
      filtered: resignedTerminatedEmployees?.length
        ? Array.from(
            new Set(
              resignedTerminatedEmployees.map((e) => e.ref_departments?.name)
            )
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

  const sortProps = {
    sortItems: [
      { name: "First Name", key: "first_name" as keyof Employee },
      { name: "Last Name", key: "last_name" as keyof Employee },
      { name: "Department", key: "department" as keyof Employee },
      { name: "Updated", key: "updated_at" as keyof Employee },
    ],
  };

  if (isLoading) {
    return (
      <section className="w-full h-full flex gap-4 overflow-hidden">
        <DataDisplay
          defaultDisplay="table"
          title="Former Employees"
          data={[]}
          isLoading={true}
          onTableDisplay={{
            config: TableConfigurations,
            layout: "auto",
          }}
        />
      </section>
    );
  }

  if (
    !resignedTerminatedEmployees ||
    resignedTerminatedEmployees.length === 0
  ) {
    return <EmptyState />;
  }

  return (
    <section className="w-full h-full flex gap-4">
      <DataDisplay
        defaultDisplay="table"
        title="Former Employees"
        data={resignedTerminatedEmployees}
        filterProps={{
          filterItems: FilterItems,
        }}
        isLoading={false}
        onTableDisplay={{
          config: TableConfigurations,
          layout: "auto",
          onRowAction: handleOnSelected,
        }}
        paginationProps={{
          data_length: resignedTerminatedEmployees.length,
        }}
        searchProps={{
          searchingItemKey: ["first_name", "last_name"],
        }}
        sortProps={sortProps}
        onView={
          selectedEmployee && (
            <div className="max-w-[500px] overflow-y-auto">
              <ViewEmployee
                employee={selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                onEmployeeUpdated={handleEmployeeUpdated}
                sortedEmployees={resignedTerminatedEmployees}
                signatories={signatories}
              />
            </div>
          )
        }
      />
    </section>
  );
};

export default Page;
