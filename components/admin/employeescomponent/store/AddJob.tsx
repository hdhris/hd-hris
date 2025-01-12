"use client";
import React, { useState, useEffect, useMemo } from "react";
import Add from "@/components/common/button/Add";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { JobPosition } from "@/types/employeee/JobType";
import {
  useJobpositionData,
  useDepartmentsData,
  useSalaryGradeData,
} from "@/services/queries";
import { useDisclosure } from "@nextui-org/react";
import Drawer from "@/components/common/Drawer";
import { Form } from "@/components/ui/form";

interface AddJobPositionProps {
  onJobAdded: () => void;
}

// Helper function to prevent circular references
function detectCircularReference(
  jobPositions: any[],
  currentJobId: number,
  selectedSuperiorId: number | null
): boolean {
  if (!selectedSuperiorId) return true;

  const visited = new Set<number>();
  let currentId: number | null = selectedSuperiorId;

  while (currentId) {
    // If we've found the current job in the hierarchy, it's a circular reference
    if (currentId === currentJobId) return false;

    // Prevent infinite loops
    if (visited.has(currentId)) break;

    visited.add(currentId);

    // Find the next superior job
    const job = jobPositions.find((j) => j.id === currentId);
    currentId = job?.superior_id || null;
  }

  return true;
}

const jobPositionSchema = z
  .object({
    baseName: z
      .string()
      .min(1, "Position base name is required")
      .regex(/^[a-zA-Z\s]*$/, "Position name should only contain letters"),
    department_id: z
      .string()
      .min(1, "Department is required")
      .nullable(),
    min_salary: z.coerce
      .number()
      .min(1, "Minimum salary is required"),
    max_salary: z.coerce
      .number()
      .min(1, "Maximum salary is required"),
    superior_id: z
      .string()
      .nullish()
      .transform((val) => val || null),
    is_active: z.boolean().default(true),
    is_superior: z.boolean().default(false),
    max_employees: z.number().optional().nullish(),
    max_department_instances: z.number().optional().nullish(),
    isIncludeDepartment: z.boolean().default(true),
  })
  .refine(
    (data) => data.min_salary <= data.max_salary,
    "Maximum salary must be greater than or equal to minimum salary"
  );

type FormData = z.infer<typeof jobPositionSchema>;

const AddJob: React.FC<AddJobPositionProps> = ({ onJobAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      max_employees: 0,
      max_department_instances: 0,
      is_active: true,
      is_superior: false,
      isIncludeDepartment: true,
    },
    mode: "onChange",
  });

  const { watch, setValue } = methods;
  const baseName = watch("baseName");
  const selectedDepartmentId = watch("department_id");
  const minSalary = watch("min_salary");
  const maxSalary = watch("max_salary");
  const isIncludeDepartment = watch("isIncludeDepartment");

  // Generate full name based on base name and department
  useEffect(() => {
    if (baseName && selectedDepartmentId) {
      const department = departments.find(
        (dept) => dept.id.toString() === selectedDepartmentId
      );

      if (department) {
        // Conditionally include department name based on toggle
        setFullName(
          isIncludeDepartment ? `${department.name} ${baseName}` : baseName
        );
      } else {
        setFullName(baseName);
      }
    } else {
      setFullName(baseName);
    }
  }, [baseName, selectedDepartmentId, isIncludeDepartment, departments]);

  // Prepare department options
  const departmentOptions = departments.reduce((acc: any[], dept) => {
    if (dept && dept.id && dept.name && dept.is_active) {
      acc.push({ value: dept.id.toString(), label: dept.name });
    }
    return acc;
  }, []);

  // Memoized superior options with circular reference prevention
  const superiorOptions = useMemo(() => {
    if (!jobPositions) return [];

    // For new job creation, we'll use a temporary ID that won't exist
    const tempJobId = -1;

    return jobPositions
      .filter(
        (job) =>
          job.id !== tempJobId && // Exclude current job (though not needed for new jobs)
          (selectedDepartmentId
            ? job.department_id === parseInt(selectedDepartmentId)
            : true) &&
          // Prevent circular references
          detectCircularReference(jobPositions, tempJobId, job.id)
      )
      .map((job) => ({
        value: job.id.toString(),
        label: job.name,
      }));
  }, [jobPositions, selectedDepartmentId]);

  // Prepare form fields
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
      description: "You can include or remove the department name manually.",
    },
    {
      name: "isIncludeDepartment",
      label: "Include Department Name",
      type: "switch",
      config: {
        defaultSelected: true,
      },
      description:
        "Toggle this option to include the department name in the job position.",
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
        options: methods.watch("is_superior") ? [] : superiorOptions,
        isDisabled: methods.watch("is_superior"),
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
      description: "Adding new job position...",
    });

    if (data.is_superior) {
      data.superior_id = null;
    }

    try {
      const formattedData = {
        name: fullName,
        department_id: data.department_id ? parseInt(data.department_id) : null,
        min_salary: data.min_salary,
        max_salary: data.max_salary,
        superior_id: data.superior_id ? parseInt(data.superior_id) : null,
        is_active: data.is_active,
        is_superior: data.is_superior,
        max_employees: data.max_employees || null,
        max_department_instances: data.max_department_instances || null,
      };

      const response = await axios.post<JobPosition>(
        "/api/employeemanagement/jobposition",
        formattedData
      );

      if (response.status === 201) {
        onJobAdded();
        methods.reset();
        toast({
          title: "Success",
          description: "Job position successfully added!",
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
          description: error.response.data.error,
          variant: "danger",
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

  if (error) {
    return (
      <div>
        Error loading job positions:{" "}
        {error.message || "Unknown error occurred."}
      </div>
    );
  }

  return (
    <>
      <Add variant="solid" name="Add Job Position" onClick={onOpen} />
      <Drawer
        title="Add New Job Position"
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
                  <p className="text-lg font-semibold text-gray-900">
                    {fullName}
                  </p>
                </div>
              )}
              <FormFields items={formFields} size="sm" />
              {minSalary && maxSalary && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700">
                    Salary Range:
                  </p>
                  <p className="text-sm text-gray-600">
                    ₱{minSalary.toLocaleString()} - ₱
                    {maxSalary.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </form>
        </Form>
      </Drawer>
    </>
  );
};

export default AddJob;
