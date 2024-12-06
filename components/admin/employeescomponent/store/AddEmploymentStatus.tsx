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

import { useDisclosure } from "@nextui-org/react";
import Drawer from "@/components/common/Drawer";
import { Form } from "@/components/ui/form";
import { EmploymentStatus } from "@/types/employeee/EmploymentStatusType";

interface AddEmploymentStatusProps {
  onEmploymentStatusAdded: () => void;
}

const EmploymentStatusSchema = z.object({
    name: z
    .string()
    .min(1, "Position name is required")
    .regex(/^[a-zA-Z\s]*$/, "Position name should only contain letters"),
});

type EmploymentStatusFormData = z.infer<typeof EmploymentStatusSchema>;

const AddEmploymentStatus: React.FC<AddEmploymentStatusProps> = ({ onEmploymentStatusAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<EmploymentStatusFormData>({
    resolver: zodResolver(EmploymentStatusSchema),
    defaultValues: {
      name: "",
    },
    mode: "onChange",
  });

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

  const onSubmit = async (data: EmploymentStatusFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Adding new employment status...",
    });

    try {
      const fullData = {
        ...data,
        
      };

      const response = await axios.post<EmploymentStatus>(
        "/api/employeemanagement/employmentstatus",
        fullData
      );

      if (response.status === 201) {
        onEmploymentStatusAdded();
        methods.reset({
          name: "",
        });
        toast({
          title: "Success",
          description: "New employment status successfully added!",
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
            "Failed to add new employment status. Please try again.",
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
      <Add variant="solid" name="Add Employment Status" onClick={onOpen} />
      <Drawer
        title="Add New Employment Status"
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

export default AddEmploymentStatus;
