import React, { useState, useEffect, useCallback } from "react";
import {
  Divider,
  Spinner,
} from "@nextui-org/react";
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
import { Branch } from "@/types/employeee/BranchType";

interface EditBranchProps {
  isOpen: boolean;
  onClose: () => void;
  branchData: Branch;
  onBranchUpdated: () => void;
}

interface BranchFormData {
  name: string;
  status: string;
  addr_region: string;
  addr_province: string;
  addr_municipal: string;
  addr_baranggay: string;
}

const EditBranch: React.FC<EditBranchProps> = ({
  isOpen,
  onClose,
  branchData,
  onBranchUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const methods = useForm<BranchFormData>({
    defaultValues: {
      name: "",
      status: "active",
      addr_region: "",
      addr_province: "",
      addr_municipal: "",
      addr_baranggay: "",
    },
  });

  const fetchBranchData = useCallback(() => {
    setIsLoading(true);
    try {
      if (!branchData || !branchData.id) {
        throw new Error("branch data not found or invalid");
      }

      methods.reset({
        name: branchData.name || "",
        status: branchData.is_active ? "active" : "inactive",
        addr_region: branchData.addr_region?.toString() || "",
        addr_province: branchData.addr_province?.toString() || "",
        addr_municipal: branchData.addr_municipal?.toString() || "",
        addr_baranggay: branchData.addr_baranggay?.toString() || "",
      });

      toast({
        title: "Success",
        description: "Branch data fetched successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error fetching branch data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch branch data. Please try again.",
        duration: 5000,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [branchData, methods, toast, onClose]);

  useEffect(() => {
    if (isOpen && branchData) {
      fetchBranchData();
    }
  }, [isOpen, branchData, fetchBranchData]);

  const onSubmit = async (data: BranchFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Updating branch...",
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

      const response = await axios.put(
        `/api/employeemanagement/branch?id=${branchData.id}`,
        filteredData
      );

      if (response.status === 200) {
        onBranchUpdated();
        toast({
          title: "Success",
          description: "Branch successfully updated!",
          duration: 3000,
        });
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error updating branch:", error);
      toast({
        title: "Error",
        description: "Failed to update branch. Please try again.",
        duration: 3000,
      });
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

  return (
    <Drawer size="md" isOpen={isOpen} onClose={onClose} title="Edit Branch">
      <form id="drawer-form" onSubmit={methods.handleSubmit(onSubmit)}>
        <Form {...methods}>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
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
                <Divider className="space-y-6 my-1" />
                <strong>Address (Optional)</strong>

                <AddressInput />
              </div>
            </>
          )}
        </Form>
      </form>
    </Drawer>
  );
};

export default EditBranch;
