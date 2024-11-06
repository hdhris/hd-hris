import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
} from "@nextui-org/react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useDepartmentsData } from "@/services/queries"; // Import the useDepartmentsData hook
import axios from "axios";
import { FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import Drawer from "@/components/common/Drawer";

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
//
const EditDepartment: React.FC<EditDepartmentProps> = ({
  isOpen,
  onClose,
  departmentId,
  onDepartmentUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form methods
  const methods = useForm<DepartmentFormData>({
    defaultValues: {
      name: "",
      color: "",
      is_active: true,
    },
  });

  const { control, handleSubmit, reset } = methods;

  // Use useSWR to fetch department data
  const { data: departments, error, isLoading } = useDepartmentsData();

  // Handle data loading and error states
  useEffect(() => {
    if (isOpen && departments && departmentId) {
      const department = departments.find((dept) => dept.id === departmentId);

      if (department) {
        reset({
          name: department.name,
          color: department.color || "",
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
  }, [isOpen, departments, departmentId, reset, toast]);

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

  // Handle form submission
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

  return (
    <Drawer title = "Edit Department" isOpen={isOpen} onClose={onClose} >
      <Form {...methods}>
        <form id = "drawer-form" onSubmit={handleSubmit(onSubmit)}>
         
              <Controller
                name="name"
                control={control}
                rules={{ required: "Department name is required" }}
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter department name"
                        variant="bordered"
                        isInvalid={!!error} // Apply invalid styling if there's an error
                      />
                    </FormControl>
                    {error && <FormMessage>{error.message}</FormMessage>}
                  </FormItem>
                )}
              />
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col items-start">
                    <label className="mb-2 text-sm font-medium text-gray-700">Color</label>
                    <div className="relative w-10 h-10 rounded-full border border-gray-300 overflow-hidden">
                      <input
                        {...field}
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      <div
                        className="absolute inset-0 rounded-full cursor-pointer"
                        style={{ backgroundColor: field.value || '#ffffff' }}
                        onClick={() => {
                          const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement | null;
                          colorInput?.click(); // Safely trigger color picker
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              />
              <Controller
                name="is_active"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox isSelected={value} onValueChange={onChange}>
                    Is Active
                  </Checkbox>
                )}
              />
            
             
        </form>
      </Form>
    </Drawer>
  );
};

export default EditDepartment;
