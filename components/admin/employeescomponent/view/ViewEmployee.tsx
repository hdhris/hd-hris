import React from "react";
import { Avatar, Divider, Button, Tooltip } from "@nextui-org/react";
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

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "resigned", label: "Resigned" },
  { value: "terminated", label: "Terminated" },
];

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

const ViewEmployee: React.FC<ViewEmployeeProps> = ({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdated,
}) => {
  const { toast } = useToast();

  const methods = useForm({
    defaultValues: {
      status: "active",
      reason: "",
      date: "",
    },
  });

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

  const status = methods.watch("status");

  const statusFields: FormInputProps[] = [
    {
      name: "status",
      label: "Status",
      type: "select",
      isRequired: true,
      config: {
        placeholder: "Select status",
        options: statusOptions,
      },
    },
    {
      name: "reason",
      label: "Reason",
      type: "text-area",
      config: {
        placeholder: "Enter reason for status change",
        className: "min-h-[100px]",
      },
      isVisible: () => status !== "active",
    },
    {
      name: "date",
      label: "Effective Date",
      type: "date-picker",
      config: {
        placeholder: "Select date",
      },
      isVisible: () => status !== "active",
    },
  ];

  const age = calculateAge(employee?.birthdate);

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
                      <Calendar size={25} className="text-gray-500" />{" "}
                      {/* Birthdate Icon */}
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
                <div className="space-y-4">
                  <FormFields items={statusFields} />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 flex justify-end gap-2 border-t">
            <Button variant="bordered" onClick={onClose}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </FormProvider>
    </Drawer>
  );
};

export default ViewEmployee;
