"use client";
import React, { useMemo, useState } from "react";
import { useformerEmployees } from "@/services/queries";
import {
  Employee,
  EmployeeAll,
  Status,
  UnavaliableStatusJSON,
} from "@/types/employeee/EmployeeType";
import {
  Avatar,
  Chip,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import DataDisplay from "@/components/common/data-display/data-display";
import Text from "@/components/Text";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import showDialog from "@/lib/utils/confirmDialog";
import ViewEmployee from "@/components/admin/employeescomponent/view/ViewEmployee";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import {
  cancelUnavailability,
  getActiveUnavailability,
  isEmployeeAvailable,
} from "@/helper/employee/unavailableEmployee";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useUserInfo } from "@/lib/utils/getEmployeInfo";

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
  const userInfo = useUserInfo();
  const { data, mutate, isLoading } = useformerEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isActivating, setIsActivating] = useState<number | null>(null);
  const [reactivationReason, setReactivationReason] = useState("");
  const [isReactivatingModalOpen, setIsReactivationModalOpen] = useState(false);
  const [pendingActivation, setPendingActivation] = useState<{
    employee: EmployeeAll;
    entry: UnavaliableStatusJSON[];
    id: number;
    status: Status;
  } | null>(null);

  const handleEmployeeUpdated = async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating employee data:", error);
    }
  };

  const formerEmployees = useMemo(() => {
    if (data) {
      return data.filter(
        (employee) =>
          !isEmployeeAvailable(employee, "resignation") ||
          !isEmployeeAvailable(employee, "termination")
      );
    }
    return [];
  }, [data]);

  const handleActivate = async ({
    employee,
    entry,
    id,
    status,
  }: {
    employee: EmployeeAll;
    entry: UnavaliableStatusJSON[];
    id: number;
    status: Status;
  }) => {
    setPendingActivation({ employee, entry, id, status });
    setIsReactivationModalOpen(true);
  };

  const handleOnSelected = (key: React.Key) => {
    const selected = formerEmployees?.find((item) => item.id === Number(key));
    setSelectedEmployee(selected ?? null);
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
      const formerData =
        getActiveUnavailability({ entry: employee.resignation_json })! ||
        getActiveUnavailability({ entry: employee.termination_json })!;
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
              <Chip
                color={
                  formerData ===
                  getActiveUnavailability({ entry: employee.termination_json })
                    ? "danger"
                    : "primary"
                }
                size="md"
                variant="dot"
              >
                {formerData ===
                getActiveUnavailability({ entry: employee.termination_json })
                  ? "Terminated"
                  : "Resigned"}
              </Chip>
            </div>
          );
        case "date":
          return (
            <div>
              {formerData
                ? toGMT8(formerData.start_date).format("MMM DD, YYYY")
                : "N/A"}
            </div>
          );
        case "reason":
          return (
            <div className="max-w-md truncate">
              {formerData ? formerData.reason : "N/A"}
            </div>
          );
        case "signatories":
          return (
            <div className="flex items-center gap-2">
              {formerData?.initiated_by && (
                <UserAvatarTooltip
                  key={formerData.initiated_by.id}
                  user={{
                    name: formerData.initiated_by.name,
                    picture: formerData.initiated_by.picture,
                    id: formerData.initiated_by.id,
                  }}
                  avatarProps={{
                    classNames: { base: "!size-9" },
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
                onPress={() => {
                  const activeResignation = getActiveUnavailability({
                    entry: employee.resignation_json,
                  });
                  const activeTermination = getActiveUnavailability({
                    entry: employee.termination_json,
                  });

                  if (activeResignation) {
                    handleActivate({
                      employee,
                      entry: employee.resignation_json,
                      id: activeResignation.id,
                      status: "resigned",
                    });
                  } else if (activeTermination) {
                    handleActivate({
                      employee,
                      entry: employee.termination_json,
                      id: activeTermination.id,
                      status: "terminated",
                    });
                  }
                }}
              >
                reactivate
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
      filtered: formerEmployees?.length
        ? Array.from(
            new Set(formerEmployees.map((e) => e.ref_departments?.name))
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

  if (!formerEmployees || formerEmployees.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="w-full h-full flex gap-4">
      <DataDisplay
        defaultDisplay="table"
        title="Former Employees"
        data={formerEmployees}
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
          data_length: formerEmployees.length,
        }}
        searchProps={{
          searchingItemKey: ["first_name", "last_name"],
        }}
        sortProps={sortProps}
        onView={
          selectedEmployee && (
            <ViewEmployee
              employee={selectedEmployee}
              onClose={() => setSelectedEmployee(null)}
              onEmployeeUpdated={handleEmployeeUpdated}
              sortedEmployees={formerEmployees}
              // signatories={signatories}
            />
          )
        }
      />

      <Modal
        isOpen={isReactivatingModalOpen}
        onClose={() => {
          setIsReactivationModalOpen(false);
          setReactivationReason("");
          setPendingActivation(null);
        }}
      >
        <ModalContent>
          <ModalHeader>
            Reactivate {pendingActivation?.employee.first_name}{" "}
            {pendingActivation?.employee.last_name}
          </ModalHeader>
          <ModalBody>
            <Textarea
              label="Reason for Unsuspending"
              placeholder="Enter reason"
              value={reactivationReason}
              onChange={(e) => setReactivationReason(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setIsReactivationModalOpen(false);
                setReactivationReason("");
                setPendingActivation(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={isActivating === pendingActivation?.employee.id}
              onPress={async () => {
                if (!pendingActivation) return;
                try {
                  setIsActivating(pendingActivation.employee.id);
                  const updateData = cancelUnavailability({
                    entry: pendingActivation.entry,
                    canceled_by: userInfo!,
                    date: toGMT8().toISOString(),
                    id: pendingActivation.id,
                    reason: reactivationReason,
                  });

                  const response = await axios.put(
                    `/api/employeemanagement/employees?id=${pendingActivation.employee.id}&type=status`,
                    { updateData, status: pendingActivation.status }
                  );

                  if (response.status === 200) {
                    toast({
                      title: "Success",
                      description: "Employee activated successfully",
                      variant: "success",
                    });
                    await mutate();
                  }
                } catch (error) {
                  console.error("Error activating employee:", error);
                  toast({
                    title: "Error",
                    description:
                      "Failed to activate employee. Please try again.",
                    variant: "danger",
                  });
                } finally {
                  setIsActivating(null);
                  setIsReactivationModalOpen(false);
                  setReactivationReason("");
                  setPendingActivation(null);
                }
              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
};

export default Page;
