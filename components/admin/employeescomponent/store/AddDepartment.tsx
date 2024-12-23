"use client"
import React, { useState } from "react";
import { useForm, FormProvider, ControllerRenderProps, FieldValues } from "react-hook-form";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Form } from "@/components/ui/form";
import Drawer from "@/components/common/Drawer";
import Add from "@/components/common/button/Add";
import { useDisclosure } from "@nextui-org/react";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { Circle } from "lucide-react";

interface AddDepartmentProps {
  onDepartmentAdded: () => void;
}

interface DepartmentFormData {
  name: string;
  color: string;
  is_active: boolean;
}

const AddDepartment: React.FC<AddDepartmentProps> = ({ onDepartmentAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<DepartmentFormData>({
    defaultValues: {
      name: "",
      color: "#4f46e5", // Default indigo color
      is_active: true,
    },
  });

  const onSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Adding new department...",
    });

    try {
      const response = await axios.post(
        "/api/employeemanagement/department",
        data
      );

      if (response.status === 201) {
        onDepartmentAdded();
        methods.reset();
        toast({
          title: "Success",
          description: "Department successfully added!",
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

  const formFields: FormInputProps[] = [
    {
      name: "name",
      label: "Department Name",
      type: "text",
      placeholder: "Enter department name",
      isRequired: true,
      config: {
        isRequired: true,
      }
    },
    {
      name: "color",
      label: "Department Color",
      type: "color",
      Component: (field: ControllerRenderProps<FieldValues, string>) => (
        <div className="relative group">
          <div 
            className="w-10 h-10 rounded-full border-2 border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 hover:scale-110"
            style={{ backgroundColor: field.value }}
            onPress={() => {
              const colorInput = document.querySelector(
                `input[name="${field.name}"]`
              ) as HTMLInputElement | null;
              colorInput?.click();
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Circle className="w-6 h-6 text-white/80" />
            </div>
          </div>
          <input
            {...field}
            type="color"
            className="sr-only"
            name={field.name}
            onChange={(e) => field.onChange(e.target.value)}
          />
        </div>
      ),
    },
    {
      name: "is_active",
      type: "switch",
      label: "Is Active",
      config: {
        defaultSelected: true,
      }
    },
  ];

  return (
    <>
      <Add variant="solid" name="Add Department" onClick={onOpen} />
      <Drawer
        title="Add Department"
        isOpen={isOpen}
        onClose={onClose}
      >
        <FormProvider {...methods}>
          <form id="drawer-form" onSubmit={methods.handleSubmit(onSubmit)}>
            <Form {...methods}>
              <div className="space-y-4">
                <FormFields items={formFields} />
              </div>
            </Form>
          </form>
        </FormProvider>
      </Drawer>
    </>
  );
};

export default AddDepartment;