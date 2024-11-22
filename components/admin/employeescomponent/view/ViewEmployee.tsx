"use client";
import React, { useState, useEffect } from "react";
import {
  Avatar,
  Divider,
  Button,
  Tooltip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import { useForm, FormProvider } from "react-hook-form";
import { LuUserCircle2 } from "react-icons/lu";
import { AiOutlinePhone, AiOutlineMail } from "react-icons/ai";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import Text from "@/components/Text";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import Drawer from "@/components/common/Drawer";
import {
  AtSignIcon,
  Calendar,
  Contact2Icon,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  PhoneCallIcon,
  User,
} from "lucide-react";
import { Employee } from "@/types/employeee/EmployeeType";
import { BsCalendar2, BsGenderAmbiguous } from "react-icons/bs";
import { Time } from "@/helper/timeParse/datetimeParse";
import { BiTime } from "react-icons/bi";
import { Worker } from "cluster";
import { IoCodeWorking } from "react-icons/io5";
import { MdWork } from "react-icons/md";

interface ViewEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onEmployeeUpdated: () => Promise<void>;
}

type ModalType = "suspend" | "resign" | "terminate" | "editSuspension" | null;

const calculateAge = (birthdate: string): number => {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const safeJSONParse = (jsonString: any) => {
  if (!jsonString) return null;
  if (typeof jsonString === "object") return jsonString;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("JSON parsing error:", e);
    return null;
  }
};

const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime())
    ? date.toISOString().split("T")[0]
    : "";
};

const ViewEmployee: React.FC<ViewEmployeeProps> = ({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdated,
}) => {
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const methods = useForm({
    defaultValues: {
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (activeModal === "editSuspension" && employee?.suspension_json) {
      const suspensionData = safeJSONParse(employee.suspension_json);
      if (suspensionData) {
        methods.reset({
          startDate: formatDateForInput(suspensionData.date),
          endDate: formatDateForInput(suspensionData.endDate),
          reason: suspensionData.reason || "",
        });
      }
    }
  }, [activeModal, employee?.suspension_json]);

  const suspensionFormFields: FormInputProps[] = [
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
      placeholder: "Type here...",
      config: {
        minRows: 3,
        maxRows: 5,
      },
    },
  ];

  const resignationFormFields: FormInputProps[] = [
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
      placeholder: "Type here...",
      config: {
        minRows: 3,
        maxRows: 5,
      },
    },
  ];

  const terminationFormFields: FormInputProps[] = [
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
      placeholder: "Type here...",
      config: {
        minRows: 3,
        maxRows: 5,
      },
    },
  ];

  const handleStatusUpdate = async (data: any) => {
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
        await onEmployeeUpdated();
        onClose();
        setActiveModal(null);
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

  const handleSuspend = (data: any) => {
    handleStatusUpdate({
      status: "suspended",
      date: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
    });
  };

  const handleResign = (data: any) => {
    handleStatusUpdate({
      status: "resigned",
      date: data.startDate,
      reason: data.reason,
    });
  };

  const handleTerminate = (data: any) => {
    handleStatusUpdate({
      status: "terminated",
      date: data.startDate,
      reason: data.reason,
    });
  };

  const handleActivate = () => {
    handleStatusUpdate({
      status: "active",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleEditSuspension = (data: any) => {
    handleStatusUpdate({
      status: "suspended",
      date: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
    });
  };

  const age = calculateAge(employee?.birthdate);

  const getModalContent = () => {
    switch (activeModal) {
      case "suspend":
        return {
          title: "Danger Action for Suspension",
          fields: suspensionFormFields,
          onSubmit: handleSuspend,
          warning:
            "WARNING: THIS WILL SUSPEND THE USER AND LIMIT THEIR ACCESSIBILITY.",
        };
      case "editSuspension":
        return {
          title: "Edit Suspension Details",
          fields: suspensionFormFields,
          onSubmit: handleEditSuspension,
          warning: "WARNING: THIS WILL UPDATE THE SUSPENSION DETAILS.",
        };
      case "resign":
        return {
          title: "Employee Resignation",
          fields: resignationFormFields,
          onSubmit: handleResign,
          warning:
            "WARNING: THIS WILL MARK THE EMPLOYEE AS RESIGNED AND REMOVE THEIR ACCESS.",
        };
      case "terminate":
        return {
          title: "Employee Termination",
          fields: terminationFormFields,
          onSubmit: handleTerminate,
          warning:
            "WARNING: THIS WILL TERMINATE THE EMPLOYEE AND REMOVE ALL ACCESS.",
        };
      default:
        return null;
    }
  };

  const renderStatusDetails = () => {
    const status = employee?.suspension_json
      ? "suspended"
      : employee?.resignation_json
      ? "resigned"
      : employee?.termination_json
      ? "terminated"
      : "active";

    switch (status) {
      case "suspended":
        const suspensionData = safeJSONParse(employee?.suspension_json);
        return (
          <div className="p-4 border rounded-lg mt-4">
            <div className="flex justify-between items-center mb-4">
              <Text className="font-semibold">Suspension Details</Text>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => setActiveModal("editSuspension")}
                >
                  Edit
                </Button>
                <Button
                  color="success"
                  variant="light"
                  onPress={handleActivate}
                >
                  Activate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <Text className="font-medium">Start Date:</Text>
                <Text>
                  {suspensionData?.date
                    ? new Date(suspensionData.date).toLocaleDateString()
                    : "N/A"}
                </Text>
              </div>
              <div>
                <Text className="font-medium">End Date:</Text>
                <Text>
                  {suspensionData?.endDate
                    ? new Date(suspensionData.endDate).toLocaleDateString()
                    : "N/A"}
                </Text>
              </div>
              <div>
                <Text className="font-medium">Reason:</Text>
                <Text>{suspensionData?.reason || "N/A"}</Text>
              </div>
            </div>
          </div>
        );

      case "resigned":
        const resignationData = safeJSONParse(employee?.resignation_json);
        return (
          <div className="p-4 border rounded-lg mt-4">
            <div className="flex justify-between items-center mb-4">
              <Text className="font-semibold">Resignation Details</Text>
              <Button color="success" variant="light" onPress={handleActivate}>
                Activate
              </Button>
            </div>
            <div className="space-y-2">
              <div>
                <Text className="font-medium">Date:</Text>
                <Text>
                  {resignationData?.date
                    ? new Date(resignationData.date).toLocaleDateString()
                    : "N/A"}
                </Text>
              </div>
              <div>
                <Text className="font-medium">Reason:</Text>
                <Text>{resignationData?.reason || "N/A"}</Text>
              </div>
            </div>
          </div>
        );

      case "terminated":
        const terminationData = safeJSONParse(employee?.termination_json);
        return (
          <div className="p-4 border rounded-lg mt-4">
            <div className="flex justify-between items-center mb-4">
              <Text className="font-semibold">Termination Details</Text>
              <Button color="success" variant="light" onPress={handleActivate}>
                Activate
              </Button>
            </div>
            <div className="space-y-2">
              <div>
                <Text className="font-medium">Date:</Text>
                <Text>
                  {terminationData?.date
                    ? new Date(terminationData.date).toLocaleDateString()
                    : "N/A"}
                </Text>
              </div>
              <div>
                <Text className="font-medium">Reason:</Text>
                <Text>{terminationData?.reason || "N/A"}</Text>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-blue-500">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 8v8M8 12h8"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div>
                  <Text>
                    Suspending this user will revoke access and stop all tasks.
                  </Text>
                </div>
              </div>
              <Button
                color="primary"
                variant="light"
                onPress={() => setActiveModal("suspend")}
              >
                Suspend
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-blue-500">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 8l8 8M16 8l-8 8"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div>
                  <Text>
                    Resigning or terminating this employee removes their access.
                  </Text>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => setActiveModal("resign")}
                >
                  Resign
                </Button>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => setActiveModal("terminate")}
                >
                  Terminate
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  const modalContent = getModalContent();

  return (
    <Drawer
      title="Employee Information"
      size="md"
      isOpen={isOpen}
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleStatusUpdate)}>
          <div className="px-6 py-4 flex-1 overflow-y-auto">
            {/* Profile Section */}
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src={employee?.picture}
                className="w-20 h-20 text-xl"
                showFallback
                fallback={
                  <LuUserCircle2 className="w-12 h-12 text-default-500" />
                }
              />
              <Text className="text-lg font-semibold">
                {`${employee?.first_name} ${employee?.middle_name || ""} 
              ${employee?.last_name}, ${employee.suffix || ""} ${
                  employee.extension || ""
                }`}
              </Text>
              <Text className="text-md text-gray-500">
                {employee?.ref_job_classes?.name}
              </Text>

              <div className="flex gap-4 mt-2">
                <Tooltip content={employee?.contact_no}>
                  <Button className="w-1 h-10 p-0 flex items-center justify-center bg-gray-500 rounded-md">
                    <Phone color="white" size={24} />
                  </Button>
                </Tooltip>
                <Tooltip content={employee?.email}>
                  <Button className="w-1 h-10 p-0 flex items-center justify-center bg-gray-500 rounded-md">
                    <AtSignIcon color="white" size={24} />
                  </Button>
                </Tooltip>
                <Tooltip content="More options">
                  <Button className="w-1 h-10 p-0 flex items-center justify-center bg-gray-500 rounded-md">
                    <MoreVertical color="white" />
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* Employee Details Section */}
            <div className="space-y-6 mt-11">
              <div>
                <div className="grid gap-4 mt-2">
                  <div>
                    <div className="flex items-center gap-4 mt-2">
                      <BsGenderAmbiguous size={25} className="text-gray-500" />
                      <Text className="text-medium font-semibold text-gray-500">
                        {employee?.gender === "M" ? "Male" : "Female"}
                      </Text>
                    </div>
                    <hr className="border-t-1 border-gray-300 my-2 mx-6 pb-2" />
                    <div className="flex items-center gap-4 mt-2">
                      <BiTime size={25} className="text-gray-500" />
                      <Text className="text-medium font-semibold text-gray-500">
                        {age} years old
                      </Text>
                    </div>
                    <hr className="border-t-1 border-gray-300 my-2 mx-6 pb-2" />
                    <div className="flex items-center gap-4 mt-2">
                      <Calendar size={25} className="text-gray-500" />
                      <Text className="text-medium font-semibold text-gray-500">
                        {new Date(employee?.birthdate).toLocaleDateString()}
                      </Text>
                    </div>
                    <hr className="border-t-1 border-gray-300 my-2 mx-6 pb-2" />
                    <div className="flex items-center gap-4 mt-2">
                      <MapPin size={25} className="text-gray-500" />
                      <Text className="text-medium font-semibold text-gray-500">
                        {
                          employee
                            ?.ref_addresses_trans_employees_addr_baranggayToref_addresses
                            .address_name
                        }
                        ,{" "}
                        {
                          employee
                            ?.ref_addresses_trans_employees_addr_municipalToref_addresses
                            .address_name
                        }
                        ,{" "}
                        {
                          employee
                            ?.ref_addresses_trans_employees_addr_provinceToref_addresses
                            .address_name
                        }
                        ,{" "}
                        {
                          employee
                            ?.ref_addresses_trans_employees_addr_regionToref_addresses
                            .address_name
                        }
                      </Text>
                    </div>
                    <hr className="border-t-1 border-gray-300 my-2 mx-6 pb-2" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Text className="text-medium font-semibold">
                    Job Information
                  </Text>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <MdWork size={25} className="text-gray-500" />
                  <Text className="text-medium font-semibold text-gray-500">
                    {employee?.ref_departments?.name}
                  </Text>
                </div>
                <hr className="border-t-1 border-gray-300 my-2 mx-6 pb-2" />
              </div>

              <div>
                <Text className="text-medium font-semibold">Danger Action</Text>
                {renderStatusDetails()}
              </div>
            </div>
          </div>

          {/* Action Modal */}
          {modalContent && (
            <Modal
              isOpen={!!activeModal}
              onClose={() => setActiveModal(null)}
              size="sm"
            >
              <ModalContent>
                <form onSubmit={methods.handleSubmit(modalContent.onSubmit)}>
                  <ModalHeader>
                    <Text className="text-medium font-semibold">
                      {modalContent.title}
                    </Text>
                  </ModalHeader>
                  <ModalBody>
                    <div className="space-y-4">
                      <FormFields items={modalContent.fields} size="sm" />
                      <Text className="text-small text-gray-500">
                        {modalContent.warning}
                      </Text>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" type="submit">
                      Confirm
                    </Button>
                    <Button
                      color="default"
                      variant="flat"
                      onPress={() => setActiveModal(null)}
                    >
                      Cancel
                    </Button>
                  </ModalFooter>
                </form>
              </ModalContent>
            </Modal>
          )}

          {/* Footer */}
          <div className="px-6 py-4 flex justify-end gap-2 border-t">
            <Button variant="bordered" onClick={onClose}>
              Cancel
            </Button>
            <Button color="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        </form>
      </FormProvider>
    </Drawer>
  );
};

export default ViewEmployee;
