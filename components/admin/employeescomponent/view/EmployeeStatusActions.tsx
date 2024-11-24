import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Chip,
} from "@nextui-org/react";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import Text from "@/components/Text";
import { Employee, Status } from "@/types/employeee/EmployeeType";
import { UseFormReturn } from "react-hook-form";
import { BiErrorCircle, BiEdit } from "react-icons/bi";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import dayjs from "dayjs";

interface EmployeeStatusActionsProps {
  employee: Employee;
  onEmployeeUpdated: () => Promise<void>;
  onClose: () => void;
  methods: UseFormReturn<any>;
  sortedEmployees: Employee[];
}

type ModalType = "suspend" | "resign" | "terminate" | null;

interface StatusInfo {
  type: string;
  modalType: ModalType;
  data: {
    startDate: string;
    endDate?: string;
    reason: string;
  } | null;
  color: string;
}

const EmployeeStatusActions: React.FC<EmployeeStatusActionsProps> = ({
  employee,
  onEmployeeUpdated,
  onClose,
  methods,
  sortedEmployees,
}) => {
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isStatusUpdateSubmitting, setIsStatusUpdateSubmitting] =
    useState(false);
  const [isActivateSubmitting, setIsActivateSubmitting] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(employee);

  useEffect(() => {
    const updatedEmployee = sortedEmployees.find((e) => e.id === employee.id);
    if (updatedEmployee) {
      setCurrentEmployee(updatedEmployee);
    }
  }, [employee, sortedEmployees]);

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM DD, YYYY");
  };

  const getFormFields = (type: ModalType): FormInputProps[] => {
    switch (type) {
      case "suspend":
        return [
          {
            name: "startDate",
            label: "Suspension Start Date",
            type: "date-picker",
            isRequired: true,
          },
          {
            name: "endDate",
            label: "Suspension End Date",
            type: "date-picker",
            isRequired: true,
          },
          {
            name: "reason",
            label: "Suspension Reason",
            type: "text-area",
            isRequired: true,
            config: {
              minRows: 3,
              maxRows: 5,
            },
          },
        ];
      case "resign":
        return [
          {
            name: "startDate",
            label: "Resignation Date",
            type: "date-picker",
            isRequired: true,
          },
          {
            name: "reason",
            label: "Resignation Reason",
            type: "text-area",
            isRequired: true,
            config: {
              minRows: 3,
              maxRows: 5,
            },
          },
        ];
      case "terminate":
        return [
          {
            name: "startDate",
            label: "Termination Date",
            type: "date-picker",
            isRequired: true,
          },
          {
            name: "reason",
            label: "Termination Reason",
            type: "text-area",
            isRequired: true,
            config: {
              minRows: 3,
              maxRows: 5,
            },
          },
        ];
      default:
        return [];
    }
  };

  const populateFormData = (type: ModalType) => {
    let formData = {};

    switch (type) {
      case "suspend":
        if (currentEmployee.suspension_json) {
          const data =
            typeof currentEmployee.suspension_json === "string"
              ? JSON.parse(currentEmployee.suspension_json)
              : currentEmployee.suspension_json;
          formData = {
            startDate: dayjs(data.startDate).format("YYYY-MM-DD"),
            endDate: dayjs(data.endDate).format("YYYY-MM-DD"),
            reason: data.reason || data.suspensionReason,
          };
        }
        break;
      case "resign":
        if (currentEmployee.resignation_json) {
          const data =
            typeof currentEmployee.resignation_json === "string"
              ? JSON.parse(currentEmployee.resignation_json)
              : currentEmployee.resignation_json;
          formData = {
            startDate: dayjs(data.resignationDate).format("YYYY-MM-DD"),
            reason: data.reason || data.resignationReason,
          };
        }
        break;
      case "terminate":
        if (currentEmployee.termination_json) {
          const data =
            typeof currentEmployee.termination_json === "string"
              ? JSON.parse(currentEmployee.termination_json)
              : currentEmployee.termination_json;
          formData = {
            startDate: dayjs(data.terminationDate).format("YYYY-MM-DD"),
            reason: data.reason || data.terminationReason,
          };
        }
        break;
    }

    methods.reset(formData);
  };

  const handleModalOpen = (type: ModalType) => {
    setActiveModal(type);
    populateFormData(type);
  };

  const handleStatusUpdate = async (formData: any) => {
    setIsStatusUpdateSubmitting(true);
    try {
      let status: Status;
      let toastVariant: "warning" | "default" | "destructive";
      let description: string;

      switch (activeModal) {
        case "suspend":
          status = "suspended";
          toastVariant = "warning";
          description = "Employee has been suspended";
          break;
        case "resign":
          status = "resigned";
          toastVariant = "default";
          description = "Employee has resigned";
          break;
        case "terminate":
          status = "terminated";
          toastVariant = "destructive";
          description = "Employee has been terminated";
          break;
        default:
          status = "active";
          toastVariant = "default";
          description = "Employee status updated successfully";
      }

      const updateData = {
        status,
        date: formData.startDate,
        reason: formData.reason,
        ...(status === "suspended" && { endDate: formData.endDate }),
      };

      const response = await axios.put(
        `/api/employeemanagement/employees?id=${currentEmployee.id}&type=status`,
        updateData
      );

      if (response.status === 200) {
        toast({
          title: `Status Updated: ${
            status.charAt(0).toUpperCase() + status.slice(1)
          }`,
          description: description,
          variant: "success",
          duration: 3000,
        });
        methods.reset();
        await onEmployeeUpdated();
        setActiveModal(null);
        onClose(); // Close the drawer
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "danger",
        duration: 5000,
      });
    } finally {
      setIsStatusUpdateSubmitting(false);
    }
  };

  const handleActivate = async () => {
    setIsActivateSubmitting(true);
    try {
      const response = await axios.put(
        `/api/employeemanagement/employees?id=${currentEmployee.id}&type=status`,
        {
          status: "active" as Status,
        }
      );

      if (response.status === 200) {
        toast({
          title: "Status Updated: Active",
          description: "Employee has been activated successfully",
          variant: "success",
          duration: 3000,
        });
        await onEmployeeUpdated();
        onClose(); // Close the drawer
      }
    } catch (error) {
      console.error("Error activating employee:", error);
      toast({
        title: "Error",
        description: "Failed to activate employee. Please try again.",
        variant: "danger",
        duration: 5000,
      });
    } finally {
      setIsActivateSubmitting(false);
    }
  };
  const StatusDisplay = () => {
    const getStatusInfo = (): StatusInfo => {
      if (currentEmployee.suspension_json) {
        const suspensionData =
          typeof currentEmployee.suspension_json === "string"
            ? JSON.parse(currentEmployee.suspension_json)
            : currentEmployee.suspension_json;
        return {
          type: "Suspended",
          modalType: "suspend",
          data: {
            startDate: suspensionData.startDate,
            endDate: suspensionData.endDate,
            reason: suspensionData.reason || suspensionData.suspensionReason,
          },
          color: "warning",
        };
      }
      if (currentEmployee.resignation_json) {
        const resignationData =
          typeof currentEmployee.resignation_json === "string"
            ? JSON.parse(currentEmployee.resignation_json)
            : currentEmployee.resignation_json;
        return {
          type: "Resigned",
          modalType: "resign",
          data: {
            startDate: resignationData.resignationDate,
            reason: resignationData.reason || resignationData.resignationReason,
          },
          color: "default",
        };
      }
      if (currentEmployee.termination_json) {
        const terminationData =
          typeof currentEmployee.termination_json === "string"
            ? JSON.parse(currentEmployee.termination_json)
            : currentEmployee.termination_json;
        return {
          type: "Terminated",
          modalType: "terminate",
          data: {
            startDate: terminationData.terminationDate,
            reason: terminationData.reason || terminationData.terminationReason,
          },
          color: "danger",
        };
      }
      return {
        type: "Active",
        modalType: null,
        data: null,
        color: "success",
      };
    };

    const status = getStatusInfo();

    return (
      <div className="mb-4 p-6 border rounded-xl bg-gray-50">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Chip size="md" color={status.color as any} variant="flat">
                {status.type}
              </Chip>
            </div>
            {status.data && (
              <div className="space-y-2">
                <Text className="text-md text-black-800">
                  {status.type === "Suspended"
                    ? "Start Date"
                    : status.type === "Resigned"
                    ? "Resignation Date"
                    : status.type === "Terminated"
                    ? "Termination Date"
                    : "Date"}
                  : {formatDate(status.data.startDate)}
                </Text>
                {status.type === "Suspended" && status.data.endDate && (
                  <Text className="text-md text-black-800">
                    End Date: {formatDate(status.data.endDate)}
                  </Text>
                )}
                <Text className="text-lg text-black-800">
                  Reason: {status.data.reason}
                </Text>
              </div>
            )}
            {status.type !== "Active" && (
              <div className="flex gap-3 mt-4">
                <Button
                  size="md"
                  variant="shadow"
                  startContent={<BiEdit className="text-default-500" />}
                  onPress={() => handleModalOpen(status.modalType)}
                  isDisabled={isStatusUpdateSubmitting || isActivateSubmitting}
                >
                  Edit Details
                </Button>
                <Button
                  size="md"
                  color="success"
                  variant="flat"
                  onPress={handleActivate}
                  isLoading={isActivateSubmitting}
                  isDisabled={isStatusUpdateSubmitting}
                >
                  Activate Employee
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getModalContent = () => {
    switch (activeModal) {
      case "suspend":
        return {
          title: "Suspend Employee",
          fields: getFormFields("suspend"),
          warning:
            "This action will suspend the employee and limit their system access.",
        };
      case "resign":
        return {
          title: "Employee Resignation",
          fields: getFormFields("resign"),
          warning:
            "This action will mark the employee as resigned and remove their system access.",
        };
      case "terminate":
        return {
          title: "Employee Termination",
          fields: getFormFields("terminate"),
          warning:
            "This action will terminate the employee and remove all system access.",
        };
      default:
        return null;
    }
  };

  const modalContent = getModalContent();
  const isActive =
    !currentEmployee.suspension_json &&
    !currentEmployee.resignation_json &&
    !currentEmployee.termination_json;

  return (
    <div className="space-y-6">
      <Text className="text-xl font-semibold">Employee Status</Text>
      <StatusDisplay />

      {isActive && (
        <>
          <Text className="text-xl font-semibold">Status Actions</Text>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-6 border rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <BiErrorCircle className="h-6 w-6 text-warning" />
                <Text className="text-gray-600">
                  Temporarily suspend employee access
                </Text>
              </div>
              <Button
                size="sm"
                color="warning"
                variant="flat"
                onPress={() => handleModalOpen("suspend")}
                isDisabled={isStatusUpdateSubmitting || isActivateSubmitting}
              >
                Suspend
              </Button>
            </div>

            <div className="flex items-center justify-between p-6 border rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <BiErrorCircle className="h-6 w-6 text-danger" />
                <Text className="text-gray-600">
                  Permanently remove employee access
                </Text>
              </div>
              <div className="flex gap-3">
                <Button
                  size="sm"
                  color="default"
                  variant="flat"
                  onPress={() => handleModalOpen("resign")}
                  isDisabled={isStatusUpdateSubmitting || isActivateSubmitting}
                >
                  Resign
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => handleModalOpen("terminate")}
                  isDisabled={isStatusUpdateSubmitting || isActivateSubmitting}
                >
                  Terminate
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {modalContent && (
        <Modal
          isOpen={!!activeModal}
          onClose={() => {
            setActiveModal(null);
            methods.reset();
          }}
          size="sm"
        >
          <ModalContent>
            <form onSubmit={methods.handleSubmit(handleStatusUpdate)}>
              <ModalHeader>
                <Text className="text-xl font-semibold">
                  {modalContent.title}
                </Text>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <FormFields items={modalContent.fields} size="sm" />
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Text className="text-sm text-gray-600">
                      {modalContent.warning}
                    </Text>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isStatusUpdateSubmitting}
                >
                  Confirm
                </Button>
                <Button
                  color="default"
                  variant="flat"
                  onPress={() => {
                    setActiveModal(null);
                    methods.reset();
                  }}
                  isDisabled={isStatusUpdateSubmitting}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};
export default EmployeeStatusActions;
