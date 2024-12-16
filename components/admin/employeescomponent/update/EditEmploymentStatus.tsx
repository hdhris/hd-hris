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
import Drawer from "@/components/common/Drawer";
import { Form } from "@/components/ui/form";
import {
  useEmploymentStatusData,
  useSalaryGradeData,
} from "@/services/queries";

interface EditEmploymentStatusProps {
  isOpen: boolean;
  onClose: () => void;
  empStatusId: number;
  onEmpStatusUpdated: () => void;
}

const EmploymentStatusSchema = z.object({
  name: z.string().min(1, "Salary grade name is required"),
});

type SalaryGradeFormData = z.infer<typeof EmploymentStatusSchema>;

const EditSalaryGrade: React.FC<EditEmploymentStatusProps> = ({
  isOpen,
  onClose,
  empStatusId,
  onEmpStatusUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: empStatus, error, isLoading } = useEmploymentStatusData();

  const methods = useForm<SalaryGradeFormData>({
    resolver: zodResolver(EmploymentStatusSchema),
    defaultValues: {
      name: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen && empStatus && empStatusId) {
      const emp = empStatus.find((empStatus) => empStatus.id === empStatusId);
      if (emp) {
        methods.reset({
          name: emp.name,
        });
      } else {
        toast({
          title: "Error",
          description: "Salary Grade not found.",
          duration: 3000,
        });
      }
    }
  }, [isOpen, empStatus, empStatusId, methods, toast]);

  const formFields: FormInputProps[] = [
    {
      name: "name",
      label: "Employment status name",
      type: "text",
      placeholder: "Enter employment status name",
      isRequired: true,
      description: "Employment status should only contain letters.",
    },
  ];

  const onSubmit = async (data: SalaryGradeFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Updating salary grade...",
    });

    try {
      const fullData = {
        ...data,
      };

      const response = await axios.put(
        `/api/employeemanagement/employmentstatus?id=${empStatusId}`,
        fullData
      );

      if (response.status === 200) {
        onEmpStatusUpdated();
        toast({
          title: "Success",
          description: "Employment Status successfully updated!",
          duration: 3000,
        });

        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error updating employment status:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast({
          title: "Error",
          description: error.response.data.error, 
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
      title="Edit Employment Status"
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
