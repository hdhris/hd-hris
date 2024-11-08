"use client"
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Divider,
} from "@nextui-org/react";
import Add from "@/components/common/button/Add";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import FormFields, {
  FormInputProps,
  Selection,
} from "@/components/common/forms/FormFields";
import AddressInput from "@/components/common/forms/address/AddressInput";
import Drawer from "@/components/common/Drawer";
import { Form } from "@/components/ui/form";

interface AddBranchProps {
  onBranchAdded: () => void;
}

interface BranchFormData {
  name: string;
  status: string;
  addr_region: string | null;
  addr_province: string | null;
  addr_municipal: string | null;
}
//
const AddBranch: React.FC<AddBranchProps> = ({ onBranchAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<BranchFormData>({
    defaultValues: {
      name: "",
      status: "active",
      addr_region: null,
      addr_province: null,
      addr_municipal: null,
    },
  });

  const onSubmit = async (data: BranchFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Adding new branch...",
    });

    try {
      const convertToNumberOrNull = (value: string | null): number | null => {
        if (value === null || value === "") return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };

      const filteredData = {
        ...data,
        is_active: data.status === "active",
        addr_region: convertToNumberOrNull(data.addr_region),
        addr_province: convertToNumberOrNull(data.addr_province),
        addr_municipal: convertToNumberOrNull(data.addr_municipal),
      };

      const response = await axios.post(
        "/api/employeemanagement/branch",
        filteredData
      );
      if (response.status === 201) {
        onBranchAdded();
        methods.reset();
        toast({
          title: "Success",
          description: "Branch successfully added!",
          duration: 3000,
        });
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data.error ||
          "Failed to add branch. Please try again.";
        const errorDetails = error.response.data.details;

        if (errorDetails) {
          const formattedErrors = errorDetails
            .map((err: any) => `${err.path.join(".")}: ${err.message}`)
            .join(", ");
          toast({
            title: "Validation Error",
            description: formattedErrors,
            duration: 5000,
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            duration: 3000,
          });
        }
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

  const formInputs: FormInputProps[] = [
    {
      name: "name",
      label: "Branch Name",
      isRequired: true,
      placeholder: "Enter branch name",
    },
  ];
//
  return (
    <>
      <Add variant="solid" name="Add Branch" onClick={onOpen} />
      <Drawer size="md" isOpen={isOpen} onClose={onClose} title="Edit Branch">
        <form id="drawer-form" onSubmit={methods.handleSubmit(onSubmit)}>
          <Form {...methods}>
            <div className="flex flex-col gap-4">
              <FormFields items={formInputs} />
              <Selection
                name="status"
                label="Status"
                isRequired
                placeholder="Select status"
                items={[
                  { key: "active", label: "Active" },
                  { key: "inactive", label: "Inactive" },
                ]}
              />

              <Divider className="my-1" />
              <strong>Address (Optional)</strong>

              <AddressInput />
            </div>
          </Form>
        </form>
      </Drawer>
    </>
  );
};

export default AddBranch;
