import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  useDisclosure,
} from "@nextui-org/react";
import Add from "@/components/common/button/Add";
import { useForm, Controller, FormProvider } from "react-hook-form";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import Drawer from "@/components/common/Drawer";

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
      color: "",
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
          description:
            error.response.data.message ||
            "Failed to add department. Please try again.",
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
      <Add variant="solid" name="Add Department" onClick={onOpen} />
      <Drawer
        title="Add Employee"
        isOpen={isOpen}
        onClose={onClose}
        // isDismissable={false}
      >
        <form id="drawer-form" onSubmit={methods.handleSubmit(onSubmit)}>
          <Form {...methods}>
            <FormItem>
              <FormLabel>Department Name</FormLabel>
              <FormControl>
                <Controller
                  name="name"
                  control={methods.control}
                  rules={{ required: "Department name is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <Input
                      {...field}
                      placeholder="Enter department name"
                      variant="bordered"
                      isInvalid={!!error} // Apply invalid styling if there's an error
                    />
                  )}
                />
              </FormControl>
              {methods.formState.errors.name && (
                <FormMessage>
                  {methods.formState.errors.name.message}
                </FormMessage>
              )}
            </FormItem>
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Controller
                  name="color"
                  control={methods.control}
                  render={({ field }) => (
                    <div className="relative w-10 h-10 rounded-full border border-gray-300 overflow-hidden">
                      <input
                        {...field}
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => field.onChange(e.target.value)} // Update form state
                      />
                      <div
                        className="absolute inset-0 rounded-full cursor-pointer"
                        style={{ backgroundColor: field.value || "#000000" }}
                        onClick={() => {
                          const colorInput = document.querySelector(
                            'input[type="color"]'
                          ) as HTMLInputElement | null;
                          colorInput?.click(); // Safely trigger color picker
                        }}
                      ></div>
                    </div>
                  )}
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormControl>
                <Controller
                  name="is_active"
                  control={methods.control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox isSelected={value} onValueChange={onChange}>
                      Is Active
                    </Checkbox>
                  )}
                />
              </FormControl>
            </FormItem>
          </Form>
        </form>
      </Drawer>
    </>
  );
};

export default AddDepartment;
