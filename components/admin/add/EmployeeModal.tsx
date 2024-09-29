import React from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Input,
} from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { Employee } from "@/types/employeee/EmployeeType";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEmployeeUpdated: () => Promise<void>;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdated,
}) => {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      status: "active",
      reason: "",
      date: "",
    },
  });

  const onSubmit = async (data: {
    status: string;
    reason?: string;
    date?: string;
  }) => {
    if (!employee) return;

    try {
      const response = await axios.put(
        `/api/employeemanagement/employees?id=${employee.id}&type=status`,
        data
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Employee status updated successfully",
          duration: 3000,
        });
        onClose();
        await onEmployeeUpdated();
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating employee status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        duration: 5000,
      });
    }
  };

  const status = watch("status");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Change Employee Status</ModalHeader>
          <ModalBody>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select label="Status" placeholder="Select status" {...field}>
                  <SelectItem key="active" value="active">
                    Active
                  </SelectItem>
                  <SelectItem key="suspended" value="suspended">
                    Suspended
                  </SelectItem>
                  <SelectItem key="resigned" value="resigned">
                    Resigned
                  </SelectItem>
                  <SelectItem key="terminated" value="terminated">
                    Terminated
                  </SelectItem>
                </Select>
              )}
            />
            {status !== "active" && (
              <>
                <Controller
                  name="reason"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Reason"
                      placeholder="Enter reason"
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Input type="date" label="Date" {...field} />
                  )}
                />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EmployeeModal;
  