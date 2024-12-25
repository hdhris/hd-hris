"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useJobpositionData } from "@/services/queries";
import axios from "axios";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { JobPosition } from "@/types/employeee/JobType";
import Drawer from "@/components/common/Drawer";
import { Form } from "@/components/ui/form";

interface EditJobPositionProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  onJobUpdated: () => void;
}

const jobPositionSchema = z.object({
  name: z
    .string()
    .min(1, "Position name is required")
    .regex(/^[a-zA-Z\s]*$/, "Position name should only contain letters"),

  superior_id: z
    .string()
    .nullish()
    .transform((val) => val || null),
  is_active: z.boolean().default(true),
  is_superior: z.boolean().default(false),
  max_employees: z.number().nullish(),
  max_department_instances: z.number().nullish(),
});

type JobPositionFormData = z.infer<typeof jobPositionSchema>;

const EditJob: React.FC<EditJobPositionProps> = ({
  isOpen,
  onClose,
  jobId,
  onJobUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: jobPositions, error, isLoading } = useJobpositionData();

  const methods = useForm<JobPositionFormData>({
    resolver: zodResolver(jobPositionSchema),
    defaultValues: {
      name: "",
      superior_id: "",
      max_employees: 0,
      max_department_instances: 0,
      is_active: true,
      is_superior: false,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen && jobPositions && jobId) {
      const job = jobPositions.find((job) => job.id === jobId);
      if (job) {
        methods.reset({
          name: job.name,
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
  }, [isOpen, jobPositions, jobId, methods, toast]);

  const formFields: FormInputProps[] = [
    {
      name: "name",
      label: "Position Name",
      type: "text",
      placeholder: "Enter position name",
      isRequired: true,
      description: "Position name should only contain letters",
    },
    {
      name: "superior_id",
      label: "next position",
      type: "select",
      placeholder: "Select next position",
      description: "Select the next position fot promotion(optional)",
      config: {
        options:
          jobPositions
            ?.filter((job) => job.id !== jobId) // Filter out the current job
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
        "Specify the maximum number of employees allowed for this position. Leave the field blank if there's no restriction.",
    },
    {
      name: "max_department_instances",
      label: "Maximum Positions per Department",
      type: "number",
      placeholder: "Enter a number or leave blank for no limit",
      isRequired: false,
      description:
        "Set the maximum number of positions allowed in each department for this job. Leave blank if there's no restriction.",
    },
    {
      name: "is_superior",
      label: "Department in charge",
      type: "switch",
      config: {
        defaultSelected: false,
      },
      description:
        "Setting a job position as department in charge means it will oversee other positions in the department. Only one in charge position per department is allowed.",
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

  const onSubmit = async (data: JobPositionFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Updating job position...",
    });

    try {
      const formattedData = {
        ...data,
        superior_id: data.superior_id ? parseInt(data.superior_id) : null,
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
    return <div>Loading job position data...</div>;
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
            <FormFields items={formFields} size="sm" />
          </div>
        </form>
      </Form>
    </Drawer>
  );
};

export default EditJob;
