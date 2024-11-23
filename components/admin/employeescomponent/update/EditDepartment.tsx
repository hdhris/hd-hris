"use client"
import React, { useEffect, useState } from "react";
import { useForm, FormProvider, ControllerRenderProps, FieldValues } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useDepartmentsData } from "@/services/queries";
import axios from "axios";
import { Form } from "@/components/ui/form";
import Drawer from "@/components/common/Drawer";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { Circle } from "lucide-react";

interface EditDepartmentProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: number;
  onDepartmentUpdated: () => void;
}

interface DepartmentFormData {
  name: string;
  color: string;
  is_active: boolean;
}

const EditDepartment: React.FC<EditDepartmentProps> = ({
  isOpen,
  onClose,
  departmentId,
  onDepartmentUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<DepartmentFormData>({
    defaultValues: {
      name: "",
      color: "",
      is_active: true,
    },
  });

  const { data: departments, error, isLoading } = useDepartmentsData();

  useEffect(() => {
    if (isOpen && departments && departmentId) {
      const department = departments.find((dept) => dept.id === departmentId);

      if (department) {
        methods.reset({
          name: department.name,
          color: department.color || "#4f46e5",
          is_active: department.is_active,
        });
      } else {
        toast({
          title: "Error",
          description: "Department not found.",
          duration: 3000,
        });
      }
    }
  }, [isOpen, departments, departmentId, methods, toast]);

  if (isLoading) {
    return <div>Loading department data...</div>;
  }

  if (error) {
    return (
      <div>
        Error loading departments: {error.message || "Unknown error occurred."}
      </div>
    );
  }

  const onSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Updating department...",
    });

    try {
      const response = await axios.put(
        `/api/employeemanagement/department?id=${departmentId}`,
        data
      );

      if (response.status === 200) {
        onDepartmentUpdated();
        toast({
          title: "Success",
          description: "Department successfully updated!",
          duration: 3000,
        });

        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error updating department:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast({
          title: "Error",
          description:
            error.response.data.message ||
            "Failed to update department. Please try again.",
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
            onClick={() => {
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
    <Drawer title="Edit Department" isOpen={isOpen} onClose={onClose}>
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
  );
};

export default EditDepartment;