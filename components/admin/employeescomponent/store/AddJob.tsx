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
  pay_rate: z
    .string()
    .regex(/^\d*\.?\d{0,2}$/, "Invalid decimal format")
    .transform((val) => (val === "" ? "0.00" : val)),
  superior_id: z
    .string()
    .nullish()
    .transform((val) => val || null),
  is_active: z.boolean().default(true),
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
      pay_rate: "0.00",
      superior_id: "",
      is_active: true,
    },
    mode: "onChange",
  });

  const handlePayRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      const formattedValue =
        value === ""
          ? "0.00"
          : value.includes(".")
          ? value.padEnd(value.indexOf(".") + 3, "0")
          : value + ".00";
      methods.setValue("pay_rate", formattedValue, { shouldValidate: true });
    }
  };

 

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
      label: "Superior Position",
      type: "auto-complete",
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
      name: "pay_rate",
      label: "Pay Rate",
      type: "text",
      placeholder: "0.00",
      description: "Pay rate must be 0 or greater (format: 0.00)",
      config: {
        onChange: handlePayRateChange,
        value: methods.watch("pay_rate"),
        pattern: "^\\d*\\.?\\d{0,2}$",
      },
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
        pay_rate: parseFloat(data.pay_rate).toFixed(2),
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
          pay_rate: "0.00",
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
          description:
            error.response.data.message ||
            "Failed to add job position. Please try again.",
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
