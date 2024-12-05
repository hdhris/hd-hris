"use client";
import React, { useEffect, useState } from "react";
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
import { useSalaryGradeData } from "@/services/queries";

interface EditSalaryGradeProps {
  isOpen: boolean;
  onClose: () => void;
  salaryGradeId: number;
  onSalaryGradeUpdated: () => void;
}

const SalaryGradeSchema = z.object({
    name: z
      .string()
      .min(1, "Salary grade name is required"),
    amount: z
      .string()
      .regex(/^\d*\.?\d{0,2}$/, "Invalid decimal format")
      .transform((val) => (val === "" ? "0.00" : val)),
  });

type SalaryGradeFormData = z.infer<typeof SalaryGradeSchema>;

const EditSalaryGrade: React.FC<EditSalaryGradeProps> = ({
  isOpen,
  onClose,
  salaryGradeId,
  onSalaryGradeUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: salaryGrade, error, isLoading } = useSalaryGradeData();

  const methods = useForm<SalaryGradeFormData>({
    resolver: zodResolver(SalaryGradeSchema),
    defaultValues: {
      name: "",
      amount: "0.00",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen && salaryGrade && salaryGradeId) {
      const salary = salaryGrade.find((salaryGrade) => salaryGrade.id === salaryGradeId);
      if (salary) {
        const salaryGrade =
          typeof salary.amount === "number"
            ? salary.amount.toFixed(2)
            : parseFloat(salary.amount).toFixed(2) || "0.00";


        methods.reset({
          name: salary.name,
          amount: salaryGrade,
        });
      } else {
        toast({
          title: "Error",
          description: "Salary Grade not found.",
          duration: 3000,
        });
      }
    }
  }, [isOpen, salaryGrade, salaryGradeId, methods, toast]);

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

  const formFields: FormInputProps[] = [
    {
      name: "name",
      label: "Salary Grade",
      type: "text",
      placeholder: "Enter salary grade name",
      isRequired: true,
      description: "Kindly put grade and number in salary grade name (e.g. Grade 3 -)",
    },
    {
      name: "amount",
      label: "Amount",
      type: "text",
      placeholder: "0.00",
      description: "Amount must be 0 or greater (format: 0.00)",
      config: {
        onChange: handleAmountChange,
        value: methods.watch("amount"),
        pattern: "^\\d*\\.?\\d{0,2}$",
      },
    },
  ];

  const onSubmit = async (data: SalaryGradeFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Updating salary grade...",
    });

    try {
      const formattedData = {
        ...data,
        amount: parseFloat(data.amount).toFixed(2),
      };

      const response = await axios.put(
        `/api/employeemanagement/salarygrade?id=${salaryGradeId}`,
        formattedData
      );

      if (response.status === 200) {
        onSalaryGradeUpdated();
        toast({
          title: "Success",
          description: "Salary Grade successfully updated!",
          duration: 3000,
        });

        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error updating Salary Grade:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast({
          title: "Error",
          description:
            error.response.data.message ||
            "Failed to update Salary Grade. Please try again.",
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
    <Drawer
      title="Edit Salary Grade"
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
  );
};

export default EditSalaryGrade;
