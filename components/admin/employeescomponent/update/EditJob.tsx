"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useJobpositionData, useDepartmentsData, useSalaryGradeData } from "@/services/queries";
import axios from "axios";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Drawer from "@/components/common/Drawer";
import { Form } from "@/components/ui/form";

interface EditJobPositionProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  onJobUpdated: () => void;
}

const jobPositionSchema = z.object({
  baseName: z
    .string()
    .min(1, "Position base name is required")
    .regex(/^[a-zA-Z\s]*$/, "Position name should only contain letters"),
  department_id: z.string().min(1, "Department is required"),
  min_salary: z.coerce.number().min(1, "Minimum salary is reqiured"),
  max_salary: z.coerce.number().min(1, "Maximum salary is required"),
  superior_id: z.string().nullish().transform((val) => val || null),
  is_active: z.boolean().default(true),
  is_superior: z.boolean().default(false),
  max_employees: z.number().nullish(),
  max_department_instances: z.number().nullish(),
}).refine((data) => {
  return data.min_salary <= data.max_salary;
}, {
  message: "Maximum salary must be greater than or equal to minimum salary",
  path: ["max_salary"],
});

type FormData = z.infer<typeof jobPositionSchema>;

const EditJob: React.FC<EditJobPositionProps> = ({
  isOpen,
  onClose,
  jobId,
  onJobUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: jobPositions, error, isLoading } = useJobpositionData();
  const { data: departments = [] } = useDepartmentsData();
  const { data: salaryGrades = [] } = useSalaryGradeData();
  const [fullName, setFullName] = useState("");

  const methods = useForm<FormData>({
    resolver: zodResolver(jobPositionSchema),
    defaultValues: {
      baseName: "",
      department_id: "",
      min_salary: 0,
      max_salary: 0,
      superior_id: "",
      max_employees: null,
      max_department_instances: null,
      is_active: true,
      is_superior: false,
    },
    mode: "onChange",
  });

  const { watch } = methods;
  const baseName = watch("baseName");
  const selectedDepartmentId = watch("department_id");
  const minSalary = watch("min_salary");
  const maxSalary = watch("max_salary");

  useEffect(() => {
    if (baseName && selectedDepartmentId) {
      const department = departments.find(
        (dept) => dept.id.toString() === selectedDepartmentId
      );
      if (department) {
        setFullName(`${department.name} ${baseName}`);
      }
    } else {
      setFullName(baseName);
    }
  }, [baseName, selectedDepartmentId, departments]);

  useEffect(() => {
    if (isOpen && jobPositions && jobId) {
      const job = jobPositions.find((job) => job.id === jobId);
      if (job) {
        const department = departments.find((dept) => dept.id === job.department_id);
        let baseName = job.name;
        if (department) {
          baseName = job.name.replace(department.name, "").trim();
        }

        methods.reset({
          baseName: baseName,
          department_id: job.department_id ? job.department_id.toString() : "",
          min_salary: Number(job.min_salary),
          max_salary: Number(job.max_salary),
          superior_id: job.superior_id ? job.superior_id.toString() : "",
          is_superior: job.is_superior,
          max_employees: job.max_employees,
          max_department_instances: job.max_department_instances,
        });
      } else {
        toast({
          title: "Error",
          description: "Job position not found.",
          duration: 3000,
        });
      }
    }
  }, [isOpen, jobPositions, jobId, departments, methods, toast]);

  const departmentOptions = departments.reduce((acc: any[], dept) => {
    if (dept && dept.id && dept.name && dept.is_active) {
      acc.push({ value: dept.id.toString(), label: dept.name });
    }
    return acc;
  }, []);

  const formFields: FormInputProps[] = [
    {
      name: "department_id",
      label: "Department",
      type: "auto-complete",
      isRequired: true,
      config: {
        placeholder: "Select Department",
        options: departmentOptions,
      },
    },
    {
      name: "baseName",
      label: "Position Name",
      type: "text",
      placeholder: "Enter position name",
      isRequired: true,
      description: "Position name will be combined with department name",
    },
    {
      name: "min_salary",
      label: "Minimum Salary Grade",
      type: "auto-complete",
      isRequired: true,
      config: {
        placeholder: "Select minimum salary grade",
        options: salaryGrades
          .sort((a, b) => Number(a.amount) - Number(b.amount))
          .map((grade) => ({
            value: grade.amount.toString(),
            label: `${grade.name}: ₱${Number(grade.amount).toLocaleString()}`,
          })),
      },
    },
    {
      name: "max_salary",
      label: "Maximum Salary Grade",
      type: "auto-complete",
      isRequired: true,
      config: {
        placeholder: "Select maximum salary grade",
        options: salaryGrades
          .filter((grade) => !minSalary || Number(grade.amount) >= minSalary)
          .sort((a, b) => Number(a.amount) - Number(b.amount))
          .map((grade) => ({
            value: grade.amount.toString(),
            label: `${grade.name}: ₱${Number(grade.amount).toLocaleString()}`,
          })),
      },
    },
    {
      name: "superior_id",
      label: "Next Higher Position",
      type: "auto-complete",
      placeholder: "Select next Higher position",
      description: "Select the next position for hierarchy purposes (optional)",
      config: {
        placeholder: "Select Next Position",
        options: jobPositions
            ?.filter((job) => job.id !== jobId)
            .map((job) => ({
              value: job.id.toString(),
              label: job.name,
            })) || [],
      },
    },
    {
      name: "max_employees",
      label: "Employee Limit",
      type: "number",
      placeholder: "Enter a number or leave blank for no limit",
      isRequired: false,
      description:
        "Specify the maximum number of employees allowed for this position",
    },
    {
      name: "max_department_instances",
      label: "Maximum Positions per Department",
      type: "number",
      placeholder: "Enter a number or leave blank for no limit",
      isRequired: false,
      description:
        "Set the maximum number of positions allowed in each department",
    },
    {
      name: "is_superior",
      label: "Department in charge",
      type: "switch",
      config: {
        defaultSelected: false,
      },
      description:
        "Setting a job position as department in charge means it will oversee other positions",
    },
    {
      name: "is_active",
      label: "Is Active",
      type: "switch",
      config: {
        defaultSelected: true,
      },
    },
  ];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Updating job position...",
    });

    try {
      const formattedData = {
        name: fullName,
        department_id: parseInt(data.department_id),
        min_salary: data.min_salary,
        max_salary: data.max_salary,
        superior_id: data.superior_id ? parseInt(data.superior_id) : null,
        is_active: data.is_active,
        is_superior: data.is_superior,
        max_employees: data.max_employees || null,
        max_department_instances: data.max_department_instances || null,
      };

      const response = await axios.put(
        `/api/employeemanagement/jobposition?id=${jobId}`,
        formattedData
      );

      if (response.status === 200) {
        onJobUpdated();
        toast({
          title: "Success",
          description: "Job position successfully updated!",
          duration: 3000,
        });

        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error updating job position:", error);
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

  if (isLoading) {
    return <div>Loading job position data....</div>;
  }

  if (error) {
    return (
      <div>
        Error loading job positions:{" "}
        {error.message || "Unknown error occurred."}
      </div>
    );
  }

  return (
    <Drawer
      title="Edit Job Position"
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
            {fullName && (
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">
                  Full Position Name:
                </p>
                <p className="text-lg font-semibold text-gray-900">{fullName}</p>
              </div>
            )}
            <FormFields items={formFields} size="sm" />
            {minSalary && maxSalary && (
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">
                  Salary Range:
                </p>
                <p className="text-sm text-gray-600">
                  ₱{minSalary.toLocaleString()} - ₱{maxSalary.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </form>
      </Form>
    </Drawer>
  );
};

export default EditJob;