"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { useForm, FormProvider } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useJobpositionData } from "@/services/queries";
import axios from "axios";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { JobPosition } from "@/types/employeee/JobType";
//
interface EditJobPositionProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  onJobUpdated: () => void;
}
//
const jobPositionSchema = z.object({
  name: z
    .string()
    .min(1, "Position name is required")
    .regex(/^[a-zA-Z\s]*$/, "Position name should only contain letters"),
  pay_rate: z
    .string()
    .regex(/^\d*\.?\d{0,2}$/, "Invalid decimal format")
    .transform((val) => (val === "" ? "0.00" : val)),
  is_active: z.boolean().default(true),
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
      pay_rate: "0.00",
      is_active: true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen && jobPositions && jobId) {
      const job = jobPositions.find((job) => job.id === jobId);
      if (job) {
        // Handle pay_rate formatting whether it's a string or number
        const payRate = typeof job.pay_rate === 'number' 
          ? job.pay_rate.toFixed(2)
          : parseFloat(job.pay_rate).toFixed(2) || "0.00";

        methods.reset({
          name: job.name,
          pay_rate: payRate,
          is_active: job.is_active,
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

  const handlePayRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      const formattedValue = value === "" ? "0.00" : 
        value.includes('.') ? value.padEnd(value.indexOf('.') + 3, '0') : 
        value + '.00';
      methods.setValue('pay_rate', formattedValue, { shouldValidate: true });
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
      name: "pay_rate",
      label: "Pay Rate",
      type: "text",
      placeholder: "0.00",
      description: "Pay rate must be 0 or greater (format: 0.00)",
      config: {
        onChange: handlePayRateChange,
        value: methods.watch('pay_rate'),
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

  if (isLoading) {
    return <div>Loading job position data...</div>;
  }

  if (error) {
    return (
      <div>
        Error loading job positions: {error.message || "Unknown error occurred."}
      </div>
    );
  }

  const onSubmit = async (data: JobPositionFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Updating job position...",
    });

    try {
      const formattedData = {
        ...data,
        pay_rate: parseFloat(data.pay_rate).toFixed(2),
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
          description:
            error.response.data.message ||
            "Failed to update job position. Please try again.",
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
    <Modal 
      size="md" 
      isOpen={isOpen} 
      onClose={onClose} 
      isDismissable={false}
    >
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
          <ModalContent>
            <ModalHeader>Edit Job Position</ModalHeader>
            <ModalBody>
              <FormFields items={formFields} size="sm" />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                onClick={() => {
                  methods.reset();
                  onClose();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                type="submit"
                disabled={isSubmitting || !methods.formState.isValid}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </FormProvider>
      </form>
    </Modal>
  );
};

export default EditJob;