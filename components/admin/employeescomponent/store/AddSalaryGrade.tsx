"use client";
import React, { useState } from "react";
import Add from "@/components/common/button/Add";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
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
  amount: z.string().min(1, "Amount is required"),
  rate_per_hour: z.string().min(1, "Rate per hour is required")
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
      amount: "",
      rate_per_hour: ""
    },
    mode: "onChange"
  });

  const handleNumberInput = (value: string) => {
    return value.replace(/[^\d.]/g, '').replace(/(\..*?)\./g, '$1');
  };

  const formFields: FormInputProps[] = [
    {
      name: "name",
      label: "Salary Grade",
      type: "text",
      placeholder: "Enter salary grade name",
      isRequired: true,
      description: "Kindly put grade and number in salary grade name (e.g. Grade 3)",
    },
    {
      name: "amount",
      label: "Salary grade amount",
      type: "text",
      placeholder: "Enter amount",
      description: "Enter amount",
      config: {
        onValueChange: (value: string) => {
          methods.setValue("amount", handleNumberInput(value), { shouldValidate: true });
        }
      }
    },
    {
      name: "rate_per_hour",
      label: "Rate per hour",
      type: "text",
      placeholder: "Enter rate per hour",
      description: "Enter rate per hour",
      config: {
        onValueChange: (value: string) => {
          methods.setValue("rate_per_hour", handleNumberInput(value), { shouldValidate: true });
        }
      }
    },
  ];

  const onSubmit = async (data: SalaryGradeFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Adding new Salary Grade...",
    });

    try {
      const response = await axios.post<SalaryGrade>(
        "/api/employeemanagement/salarygrade",
        data
      );

      if (response.status === 201) {
        onSalaryAdded();
        methods.reset({
          name: "",
          amount: "",
          rate_per_hour: ""
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
            "Failed to create new salary grade. Please try again.",
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