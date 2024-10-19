"use client"
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
  useDisclosure,
} from "@nextui-org/react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useJobpositionData } from "@/services/queries";
import axios from "axios";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface EditJobPositionProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  onJobUpdated: () => void;
}

interface JobPositionFormData {
  name: string;
  is_active: boolean;
}

const EditJobPosition: React.FC<EditJobPositionProps> = ({
  isOpen,
  onClose,
  jobId,
  onJobUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<JobPositionFormData>({
    defaultValues: {
      name: "",
      is_active: true,
    },
  });

  const { data: jobPositions, error, isLoading } = useJobpositionData();

  useEffect(() => {
    if (isOpen && jobPositions && jobId) {
      const job = jobPositions.find((job) => job.id === jobId);

      if (job) {
        methods.reset({
          name: job.name,
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
      const response = await axios.put(
        `/api/employeemanagement/jobposition?id=${jobId}`,
        data
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
    <Modal size="md" isOpen={isOpen} onClose={onClose} isDismissable={false}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <ModalContent>
            <ModalHeader>Edit Job Position</ModalHeader>
            <ModalBody>
              <Controller
                name="name"
                control={methods.control}
                rules={{ required: "Position name is required" }}
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Position Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter position name"
                        variant="bordered"
                        isInvalid={!!error}
                      />
                    </FormControl>
                    {error && <FormMessage>{error.message}</FormMessage>}
                  </FormItem>
                )}
              />
              <Controller
                name="is_active"
                control={methods.control}
                render={({ field: { onChange, value } }) => (
                  <FormItem>
                    <FormControl>
                      <Checkbox isSelected={value} onValueChange={onChange}>
                        Is Active
                      </Checkbox>
                    </FormControl>
                  </FormItem>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default EditJobPosition;