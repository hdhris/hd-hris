"use client"
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
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import Add from "@/components/common/button/Add";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useDepartmentsData } from "@/services/queries";
import axios from "axios";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface AddJobPositionProps {
  onJobAdded: () => void;
}

interface JobPositionFormData {
  name: string;
  department_id: number;
  is_active: boolean;
}

const AddJobPosition: React.FC<AddJobPositionProps> = ({ onJobAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: departments } = useDepartmentsData();

  const methods = useForm<JobPositionFormData>({
    defaultValues: {
      name: "",
      department_id: 0,
      is_active: true,
    },
  });

  const onSubmit = async (data: JobPositionFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Adding new job position...",
    });

    try {
      const response = await axios.post(
        "/api/employeemanagement/jobposition",
        data  
      );

      if (response.status === 201) {
        onJobAdded();
        methods.reset();
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
          description: error.response.data.message || "Failed to add job position. Please try again.",
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
      <Add variant="flat" name="Add Job Position" onClick={onOpen} />
      <Modal size="md" isOpen={isOpen} onClose={onClose} isDismissable={false}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormProvider {...methods}>
            <ModalContent>
              <ModalHeader>Add New Job Position</ModalHeader>
              <ModalBody>
                <FormItem>
                  <FormLabel>Position Name</FormLabel>
                  <FormControl>
                    <Controller
                      name="name"
                      control={methods.control}
                      rules={{ required: "Position name is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          {...field}
                          placeholder="Enter position name"
                          variant="bordered"
                          isInvalid={!!error}
                        />
                      )}
                    />
                  </FormControl>
                  {methods.formState.errors.name && (
                    <FormMessage>{methods.formState.errors.name.message}</FormMessage>
                  )}
                </FormItem>
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Controller
                      name="department_id"
                      control={methods.control}
                      rules={{ required: "Department is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          {...field}
                          items={departments || []}
                          placeholder="Select department"
                          labelPlacement="outside"
                          isInvalid={!!error}
                        >
                          {(department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name}
                            </SelectItem>
                          )}
                        </Select>
                      )}
                    />
                  </FormControl>
                  {methods.formState.errors.department_id && (
                    <FormMessage>{methods.formState.errors.department_id.message}</FormMessage>
                  )}
                </FormItem>
                <FormItem>
                  <FormControl>
                    <Controller
                      name="is_active"
                      control={methods.control}
                      render={({ field: { onChange, value } }) => (
                        <Checkbox
                          isSelected={value}
                          onValueChange={onChange}
                        >
                          Is Active
                        </Checkbox>
                      )}
                    />
                  </FormControl>
                </FormItem>
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
                <Button color="primary" type="submit" disabled={isSubmitting}>
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

export default AddJobPosition;