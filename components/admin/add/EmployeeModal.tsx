import React, { useEffect } from "react";
import {
  Button,
  DatePicker,
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
import {
  parseDate,
  CalendarDate as CalendarDateType,
} from "@internationalized/date";

interface StatusFormData {
  status: "active" | "suspended" | "resigned" | "terminated";
  reason: string;
  date: string;
}

const safeParseDate = (dateString: string) => {
  try {
    const datePart = dateString.split("T")[0];
    return parseDate(datePart);
  } catch (error) {
    console.error("Date parsing error:", error);
    return null;
  }
};

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEmployeeUpdated: () => Promise<void>;
}

const getEmployeeStatus = (employee: Employee): StatusFormData["status"] => {
  if (employee.termination_json) return "terminated";
  if (employee.resignation_json) return "resigned";
  if (employee.suspension_json) return "suspended";
  return "active";
};

// Type guard to validate JSON shape
const isValidStatusJson = (json: any): json is { reason: string; date: string } =>
  json && typeof json === "object" && "reason" in json && "date" in json;

const getStatusJson = (
  employee: Employee,
  status: StatusFormData["status"]
): { reason: string; date: string } | null => {
  switch (status) {
    case "terminated":
      return isValidStatusJson(employee.termination_json) ? employee.termination_json : null;
    case "resigned":
      return isValidStatusJson(employee.resignation_json) ? employee.resignation_json : null;
    case "suspended":
      return isValidStatusJson(employee.suspension_json) ? employee.suspension_json : null;
    default:
      return null; // For "active", there's no JSON data.
  }
};

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdated,
}) => {
  const methods = useForm<StatusFormData>({
    defaultValues: {
      status: "active",
      reason: "",
      date: "",
    },
  });

  const { handleSubmit, watch, reset, control } = methods;

  useEffect(() => {
    if (employee) {
      const status = getEmployeeStatus(employee);
      const statusJson = getStatusJson(employee, status);
      reset({
        status,
        reason: statusJson?.reason || "",
        date: statusJson?.date || "",
      });
    }
  }, [employee, reset]);

  const onSubmit: SubmitHandler<StatusFormData> = async (data) => {
    if (!employee) return;

    const url = `/api/employeemanagement/employees?id=${employee.id}&type=status`;

    try {
      const response = await axios.put(url, data);

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
        console.error("Error response data:", error.response?.data);
        errorMessage =
          error.response?.data?.error ||
          error.message ||
          "No response received from server.";
      }
      toast({
        title: "Error",
        description: errorMessage,
        duration: 5000,
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
                          variant="bordered"
                        >
                          <SelectItem key="active" value="active">Active</SelectItem>
                          <SelectItem key="suspended" value="suspended">Suspended</SelectItem>
                          <SelectItem key="resigned" value="resigned">Resigned</SelectItem>
                          <SelectItem key="terminated" value="terminated">Terminated</SelectItem>
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
                            <Input
                              {...field}
                              placeholder="Enter reason"
                              variant="bordered"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="date"
                      render={({ field }) => {
                        const parsedValue = field.value
                          ? safeParseDate(field.value)
                          : null;
                        return (
                          <FormItem>
                            <FormLabel>Date:</FormLabel>
                            <FormControl>
                              <DatePicker
                                value={parsedValue}
                                onChange={(date: CalendarDateType | null) => {
                                  field.onChange(date ? date.toString() : "");
                                }}
                                aria-label="Status Change Date"
                                variant="bordered"
                                className="border rounded"
                                showMonthAndYearPickers
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
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
