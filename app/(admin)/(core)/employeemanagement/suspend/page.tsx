"use client";
import React, { useMemo, useState } from "react";
import { useSuspendedEmployees } from "@/services/queries";
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
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import DataDisplay from "@/components/common/data-display/data-display";
import Text from "@/components/Text";
import dayjs from "dayjs";
import axios from "axios";
import { Modal } from "@nextui-org/react";
import { toast } from "@/components/ui/use-toast";
import ViewEmployee from "@/components/admin/employeescomponent/view/ViewEmployee";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import {
  cancelUnavailability,
  getActiveUnavailability,
  isEmployeeAvailable,
} from "@/helper/employee/unavailableEmployee";
import { useUserInfo } from "@/lib/utils/getEmployeInfo";
import { toGMT8 } from "@/lib/utils/toGMT8";

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)]">
      <div className="text-center space-y-3">
        <Text className="text-xl font-bold text-gray-700">
          No Suspended Employees Found
        </Text>
        <Text className="text-gray-500">
          There are no suspended employees at the moment.
        </Text>
        <Text className="text-sm text-gray-400">
          Suspended employees will appear here when their status changes.
        </Text>
      </div>
    </div>
  );
};

const Page: React.FC = () => {
  const { data, mutate, isLoading } = useSuspendedEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isActivating, setIsActivating] = useState<number | null>(null);
  const userInfo = useUserInfo();
  const [unsuspendReason, setUnsuspendReason] = useState("");
  const [isUnsuspendModalOpen, setIsUnsuspendModalOpen] = useState(false);
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

  const suspendedEmployees = useMemo(() => {
    if (data) {
      return data.filter(
        (employee) => !isEmployeeAvailable({ employee, find: ["suspension"] })
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
    setIsUnsuspendModalOpen(true);
  };

  const handleOnSelected = (key: React.Key) => {
    const selected = suspendedEmployees?.find(
      (item) => item.id === Number(key)
    );
    setSelectedEmployee(selected ?? null);
  };

  const unsuspendReasonOptions = [
    {
      key: "suspension-period-completed",
      label: "Suspension period completed",
    },
    {
      key: "satisfactory-behavior",
      label: "Satisfactory behavior improvement",
    },
    {
      key: "corrective-action-completed",
      label: "Corrective action plan completed",
    },
    {
      key: "investigation-concluded",
      label: "Investigation concluded favorably",
    },
    { key: "management-decision", label: "Management discretion/decision" },
    { key: "appeal-approved", label: "Appeal approved" },
    { key: "conditions-met", label: "Suspension conditions met" },
    { key: "policy-compliance", label: "Demonstrated policy compliance" },
    {
      key: "performance-improvement",
      label: "Performance improvement achieved",
    },
    { key: "training-completed", label: "Required training completed" },
    { key: "documentation-provided", label: "Required documentation provided" },
    { key: "grievance-resolved", label: "Workplace grievance resolved" },
    { key: "mediation-successful", label: "Successful mediation outcome" },
    { key: "early-reinstatement", label: "Early reinstatement approved" },
    { key: "disciplinary-review", label: "Positive disciplinary review" },
  ];

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "department", name: "Department", sortable: true },
      { uid: "position", name: "Position", sortable: true },
      { uid: "suspendedDate", name: "Suspended Date", sortable: true },
      { uid: "endDate", name: "End Date", sortable: true },
      { uid: "reason", name: "Suspended Reason" },
      { uid: "signatories", name: "Suspended by", sortable: false },
      { uid: "actions", name: "Actions" },
    ],

    rowCell: (employee: Employee, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;
      const suspensionData = getActiveUnavailability({
        entry: employee.suspension_json,
      })!;

      switch (key) {
        case "name":
          return (
            <div className="flex items-center gap-4">
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
        case "suspendedDate":
          return (
            <div>
              {suspensionData
                ? dayjs(suspensionData.start_date).format("MMM DD, YYYY")
                : "N/A"}
            </div>
          );
        case "endDate":
          return (
            <div>
              {suspensionData
                ? dayjs(suspensionData.end_date).format("MMM DD, YYYY")
                : "N/A"}
            </div>
          );
        case "reason":
          return (
            <div className="max-w-md truncate">
              {suspensionData ? suspensionData.reason : "N/A"}
            </div>
          );
        case "signatories":
          return (
            <div className="flex items-center gap-2">
              {suspensionData?.initiated_by && (
                <UserAvatarTooltip
                  key={suspensionData.initiated_by.id}
                  user={{
                    name: suspensionData.initiated_by.name,
                    picture: suspensionData.initiated_by.picture,
                    id: suspensionData.initiated_by.id,
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
                onPress={() =>
                  handleActivate({
                    employee,
                    entry: employee.suspension_json,
                    id: suspensionData.id,
                    status: "suspended",
                  })
                }
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
      { name: "Updated", key: "updated_at" as keyof Employee },
    ],
  };

  if (isLoading) {
    return (
      <section className="w-full h-full flex gap-4 overflow-hidden">
        <DataDisplay
          defaultDisplay="table"
          title="Suspended Employees"
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

  if (!suspendedEmployees || suspendedEmployees.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="w-full h-full flex gap-4 overflow-hidden">
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
          layout: "auto",
          onRowAction: handleOnSelected,
        }}
        paginationProps={{
          data_length: suspendedEmployees.length,
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
              sortedEmployees={suspendedEmployees}
            />
          )
        }
      />

      <Modal
        isOpen={isUnsuspendModalOpen}
        onClose={() => {
          setIsUnsuspendModalOpen(false);
          setUnsuspendReason("");
          setPendingActivation(null);
        }}
      >
        <ModalContent>
          <ModalHeader>
            Unsuspend {pendingActivation?.employee.first_name}{" "}
            {pendingActivation?.employee.last_name}
          </ModalHeader>
          <ModalBody>
            <Autocomplete
              allowsCustomValue
              defaultItems={unsuspendReasonOptions}
              placeholder="Select or enter unsuspension reason"
              label="Reason for Unsuspending"
              variant="bordered"
              className="w-full"
              value={unsuspendReason}
              onSelectionChange={(key) => setUnsuspendReason(key as string)}
              onInputChange={(value) => setUnsuspendReason(value)}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
              )}
            </Autocomplete>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setIsUnsuspendModalOpen(false);
                setUnsuspendReason("");
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
                    reason: unsuspendReason,
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
                  setIsUnsuspendModalOpen(false);
                  setUnsuspendReason("");
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
