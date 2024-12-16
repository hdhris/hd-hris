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
import { JobPosition } from "@/types/employeee/JobType";
import { useJobpositionData } from "@/services/queries";
import { useDisclosure } from "@nextui-org/react";
import Drawer from "@/components/common/Drawer";
import { Form } from "@/components/ui/form";

interface AddJobPositionProps {
  onJobAdded: () => void;
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

const AddJob: React.FC<AddJobPositionProps> = ({ onJobAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: jobPositions } = useJobpositionData();

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
      label: "Next position",
      type: "select",
      placeholder: "Select superior position",
      description: "Select the superior position (optional)",
      config: {
        options:
          jobPositions?.map((job) => ({
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
      label: "Is Department Head",
      type: "switch",
      config: {
        defaultSelected: false,
      },
      description:
        "Setting a job position as department head means it will oversee other positions in the department. Only one head position per department is allowed.",
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
      description: "Adding new job position...",
    });

    try {
      const formattedData = {
        ...data,
        superior_id: data.superior_id ? parseInt(data.superior_id) : null,
      };

      const response = await axios.post<JobPosition>(
        "/api/employeemanagement/jobposition",
        formattedData
      );

      if (response.status === 201) {
        onJobAdded();
        methods.reset({
          name: "",
          superior_id: "",
          is_active: true,
        });
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
              <FormFields items={formFields} size="sm" />
            </div>
          </form>
        </Form>
      </Drawer>
    </>
  );
};

export default AddJob;
