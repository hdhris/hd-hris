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
import { config } from "process";

interface AddBranchProps {
  onBranchAdded: () => void;
}

interface BranchFormData {
  name: string;
  status: string;
  addr_region: string;
  addr_province: string;
  addr_municipal: string;
  addr_baranggay: string;
}

const AddBranch: React.FC<AddBranchProps> = ({ onBranchAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<BranchFormData>({
    defaultValues: {
      name: "",
      status: "active",
      addr_region: "",
      addr_province: "",
      addr_municipal: "",
      addr_baranggay: ""
    },
  });
//
  const onSubmit = async (data: BranchFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Adding new branch...",
    });

    try {

      const filteredData = {
        ...data,
        is_active: data.status === "active",
        addr_region: parseInt(data.addr_region, 10),
        addr_province: parseInt(data.addr_province, 10),
        addr_municipal: parseInt(data.addr_municipal, 10),
        addr_baranggay: parseInt(data.addr_baranggay, 10),
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
        toast({
          title: "Error",
          description: error.response.data.error, 
          variant:"danger",
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
      <Drawer size="md" isOpen={isOpen} onClose={onClose} title="Add Branch">
        <form id="drawer-form" onSubmit={methods.handleSubmit(onSubmit)}>
          <Form {...methods}>
            <div className="flex flex-col gap-4">
              <FormFields items={formInputs} />
              <Selection
                name="status"
                label="Status"
                isRequired
                placeholder="Select status"
                isDisabled
                items={[
                  { key: "active", label: "Active" },
                  { key: "inactive", label: "Inactive" },
                ]}
              />

              <Divider className="my-1" />
              <strong>Address</strong>

              <AddressInput />
            </div>
          </Form>
        </form>
      </Drawer>
    </>
  );
};

export default AddBranch;
