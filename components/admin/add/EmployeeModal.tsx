import React, { useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { Employee } from "@/types/employeee/EmployeeType";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface StatusFormData {
  status: string;
  reason: string;
  date: string;
}

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
  const methods = useForm<StatusFormData>({
    defaultValues: {
      status: employee?.status || "active",
      reason: "",
      date: "",
    },
  });

  const { handleSubmit, watch, reset, control } = methods;

  // Reset form when modal opens or employee prop changes
  useEffect(() => {
    if (employee) {
      reset({
        status: employee.status || "active",
        reason: "",
        date: "",
      });
    }
  }, [employee, reset]);

  const onSubmit: SubmitHandler<StatusFormData> = async (data) => {
    if (!employee) return;

    const { status, reason, date } = data;
    const statusData = status !== "active" ? { reason, date } : null;

    const url = `/api/employeemanagement/employees?id=${employee.id}&type=status`;
    const payload = {
      status,
      [`${status}_json`]: statusData ? JSON.stringify(statusData) : undefined, // Ensuring correct type
    };

    try {
      const response = await axios.put(url, payload);

      if (response.status === 200) {
        reset();
        onClose();
        toast({
          title: "Success",
          description: "Employee status updated successfully",
          duration: 3000,
        });
        await onEmployeeUpdated();
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = "Failed to update status. Please try again.";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message || "No response received from server.";
      }
      toast({
        title: "Error",
        description: errorMessage,
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>Change Employee Status</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status:</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          placeholder="Select Status"
                          selectedKeys={[field.value]}
                          onSelectionChange={(keys) =>
                            field.onChange(Array.from(keys)[0])
                          }
                        >
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watch("status") !== "active" && (
                  <>
                    <FormField
                      control={control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason:</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter reason" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date:</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
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
        </FormProvider>
      </ModalContent>
    </Modal>
  );
};

export default EmployeeModal;
