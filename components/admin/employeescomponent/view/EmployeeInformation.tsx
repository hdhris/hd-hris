// components/admin/employeescomponent/view/EmployeeInformation.tsx

import React from "react";
import { Avatar, Button } from "@nextui-org/react";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { Employee } from "@/types/employeee/EmployeeType";
import { UseFormReturn } from "react-hook-form";
import Text from "@/components/Text";
import { LuUserCircle2 } from "react-icons/lu";
import { BsGenderAmbiguous, BsCalendar2 } from "react-icons/bs";
import { BiTime, BiMapPin } from "react-icons/bi";
import {
  MdWork,
  MdSchedule,
  MdOutlineEmail,
  MdOutlineMoreVert,
  MdOutlinePhone,
} from "react-icons/md";

interface EmployeeInformationProps {
  employee: Employee;
  methods: UseFormReturn<any>;
}

const EmployeeInformation: React.FC<EmployeeInformationProps> = ({
  employee,
  methods,
}) => {
  const employeeInfoFields: FormInputProps[] = [
    {
      name: "gender",
      label: "Gender",
      type: "text",

      startContent: <BsGenderAmbiguous className="text-default-500 w-5 h-5" />,
      config: {
        variant: "underlined",
        disabled: true,
      },
    },
    {
      name: "age",
      label: "Age",
      type: "text",

      startContent: <BiTime className="text-default-500 w-5 h-5" />,
      config: {
        variant: "underlined",
        disabled: true,
      },
    },
    {
      name: "birthdate",
      label: "Birthdate",
      type: "date",

      startContent: <BsCalendar2 className="text-default-500 w-5 h-5" />,
      config: {
        variant: "underlined",
        disabled: true,
      },
    },
    {
      name: "address",
      label: "Address",
      type: "text",

      startContent: <BiMapPin className="text-default-500 w-5 h-5" />,
      config: {
        variant: "underlined",
        disabled: true,
      },
    },
  ];

  const jobInfoFields: FormInputProps[] = [
    {
      name: "workingType",
      label: "Working Type",
      type: "text",

      startContent: <MdWork className="text-default-500 w-5 h-5" />,
      config: {
        variant: "underlined",
        disabled: true,
      },
    },
    // {
    //   name: "schedule",
    //   label: "Schedule",
    //   type: "text",
    //   inputDisabled: true,
    //   startContent: <MdSchedule className="text-default-500 w-5 h-5" />,
    // }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <Avatar
          src={employee?.picture}
          className="w-20 h-20 text-xl"
          showFallback
          fallback={<LuUserCircle2 className="w-12 h-12 text-default-500" />}
        />
        <Text className="font-semibold">
          {`${employee?.first_name} ${employee?.middle_name || ""} ${
            employee?.last_name
          }`}
        </Text>
        <Text className="text-default-500">
          {employee?.ref_job_classes?.name}
        </Text>
        <div className="flex gap-2">
          <Button isIconOnly color="primary" variant="flat" aria-label="Phone">
            <MdOutlinePhone className="w-5 h-5" />
          </Button>
          <Button isIconOnly color="primary" variant="flat" aria-label="Email">
            <MdOutlineEmail className="w-5 h-5" />
          </Button>
          <Button isIconOnly color="primary" variant="flat" aria-label="More">
            <MdOutlineMoreVert className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Employee Information Section */}
      <div className="space-y-4">
        <FormFields items={employeeInfoFields} size="lg" />
      </div>

      {/* Job Information Section */}
      <div className="space-y-4">
        <Text className="text-medium font-semibold">Job Information</Text>
        <FormFields items={jobInfoFields} size="lg" />
      </div>
    </div>
  );
};

export default EmployeeInformation;
