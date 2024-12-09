"use client";
import React, { useState } from "react";
import Add from "@/components/common/button/Add";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SalaryGrade } from "@/types/employeee/SalaryType";

import { useDisclosure } from "@nextui-org/react";
import Drawer from "@/components/common/Drawer";
import { Form } from "@/components/ui/form";

interface AddSalaryGradeProps {
  onSalaryAdded: () => void;
}

const SalaryGradeSchema = z.object({
  name: z.string().min(1, "Salary grade name is required"),
  amount: z
    .string()
    .regex(/^\d*\.?\d{0,2}$/, "Invalid decimal format")
    .transform((val) => (val === "" ? "0.00" : val)),
  rate_per_hour: z
    .string()
    .regex(/^\d*\.?\d{0,2}$/, "Invalid decimal format")
    .transform((val) => (val === "" ? "0.00" : val)),
});

type SalaryGradeFormData = z.infer<typeof SalaryGradeSchema>;

const AddSalaryGrade: React.FC<AddSalaryGradeProps> = ({ onSalaryAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<SalaryGradeFormData>({
    resolver: zodResolver(SalaryGradeSchema),
    defaultValues: {
      name: "",
      amount: "0.00",
    },
    mode: "onChange",
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      const formattedValue =
        value === ""
          ? "0.00"
          : value.includes(".")
          ? value.padEnd(value.indexOf(".") + 3, "0")
          : value + ".00";
      methods.setValue("amount", formattedValue, { shouldValidate: true });
    }
  };

  const handleRatePerHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      const formattedValue =
        value === ""
          ? "0.00"
          : value.includes(".")
          ? value.padEnd(value.indexOf(".") + 3, "0")
          : value + ".00";
      methods.setValue("rate_per_hour", formattedValue, { shouldValidate: true });
    }
  };

  const formFields: FormInputProps[] = [
    {
      name: "name",
      label: "Salary Grade",
      type: "text",
      placeholder: "Enter salary grade name",
      isRequired: true,
      description:
        "Kindly put grade and number in salary grade name (e.g. Grade 3 -)",
    },
    {
      name: "amount",
      label: "Salary grade amount",
      type: "text",
      placeholder: "0.00",
      description: "Monthly salary grade amount must be 0 or greater (format: 0.00)",
      config: {
        onChange: handleAmountChange,
        value: methods.watch("amount"),
        pattern: "^\\d*\\.?\\d{0,2}$",
      },
    },
    {
      name: "rate_per_hour",
      label: "Rate per hour",
      type: "text",
      placeholder: "0.00",
      description: "Amount must be 0 or greater (format: 0.00)",
      config: {
        onChange: handleRatePerHourChange,
        value: methods.watch("rate_per_hour"),
        pattern: "^\\d*\\.?\\d{0,2}$",
      },
    },
  
  ];

  const onSubmit = async (data: SalaryGradeFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Adding new Salary Grade...",
    });

    try {
      const formattedData = {
        ...data,
        amount: parseFloat(data.amount).toFixed(2),
        rate_per_hour: parseFloat(data. rate_per_hour).toFixed(2),
      };

      const response = await axios.post<SalaryGrade>(
        "/api/employeemanagement/salarygrade",
        formattedData
      );

      if (response.status === 201) {
        onSalaryAdded();
        methods.reset({
          name: "",
          amount: "0.00",
          rate_per_hour: "0.00"
        });
        toast({
          title: "Success",
          description: "Salary Grade successfully added!",
          duration: 3000,
        });

        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast({
          title: "Error",
          description:
            error.response.data.message ||
            "Failed to add new salary grade. Please try again.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          duration: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Add variant="solid" name="Add Salary Grade" onClick={onOpen} />
      <Drawer
        title="Add New Salary Grade"
        size="sm"
        isOpen={isOpen}
        onClose={() => {
          methods.reset();
          onClose();
        }}
      >
        <Form {...methods}>
          <form
            className="mb-4 space-y-4"
            id="drawer-form"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <div className="space-y-4">
              <FormFields items={formFields} size="sm" />
            </div>
          </form>
        </Form>
      </Drawer>
    </>
  );
};

export default AddSalaryGrade;
