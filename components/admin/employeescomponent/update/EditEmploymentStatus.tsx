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
  appraisal_interval: z.coerce.number().int().min(1),
  superior_id: z
      .string()
      .nullish()
      .transform((val) => val || null),
});

type EmploymentStatusFormData = z.infer<typeof EmploymentStatusSchema>;

const EditSalaryGrade: React.FC<EditEmploymentStatusProps> = ({
  isOpen,
  onClose,
  empStatusId,
  onEmpStatusUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: empStatus, error, isLoading } = useEmploymentStatusData();

  const methods = useForm<EmploymentStatusFormData>({
    resolver: zodResolver(EmploymentStatusSchema),
    defaultValues: {
      name: "",
      appraisal_interval: 4,
      superior_id: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen && empStatus && empStatusId) {
      const emp = empStatus.find((empStatus) => empStatus.id === empStatusId);
      if (emp) {
        methods.reset({
          name: emp.name,
          appraisal_interval: emp.appraisal_interval,
          superior_id: emp.superior_id?.toString() || "",
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
    {
      name: "appraisal_interval",
      label: "Appraisal Interval",
      type: "number",
      placeholder: "Enter appraisal interval",
      isRequired: true,
      description: "Appraisal interval should be a number.",
    },
    {
      name: "superior_id",
      label: "next status",
      type: "select",
      placeholder: "Select next status",
      description: "Select the next status for this employment status for appraisal purposes (optional)",
      config: {
        options:
        empStatus
            ?.filter((emp) => emp.id !== empStatusId) // Filter out the current job
            .map((emp) => ({
              value: emp.id.toString(),
              label: emp.name,
            })) || [],
      },
    },
  ];

  const onSubmit = async (data: EmploymentStatusFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Updating salary grade...",
    });

    try {
      const fullData = {
        ...data,
        superior_id: data.superior_id ? parseInt(data.superior_id) : null,
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
