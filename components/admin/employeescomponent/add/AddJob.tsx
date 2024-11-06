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
import Add from "@/components/common/button/Add";
import { useForm, FormProvider } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { JobPosition } from "@/types/employeee/JobType";

interface AddJobPositionProps {
  onJobAdded: () => void;
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

const AddJob: React.FC<AddJobPositionProps> = ({ onJobAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    if (isOpen) {
      methods.reset({
        name: "",
        pay_rate: "0.00",
        is_active: true,
      });
    }
  }, [isOpen, methods]);

  const handlePayRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      // Format the value to always have 2 decimal places when there's a value
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
      <Modal 
        size="md" 
        isOpen={isOpen} 
        onClose={onClose} 
        isDismissable={false}
      >
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormProvider {...methods}>
            <ModalContent>
              <ModalHeader>Add New Job Position</ModalHeader>
              <ModalBody>
                <FormFields items={formFields} size="sm" />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  onClick={() => {
                    methods.reset({
                      name: "",
                      pay_rate: "0.00",
                      is_active: true,
                    });
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
    </>
  );
};

export default AddJob;