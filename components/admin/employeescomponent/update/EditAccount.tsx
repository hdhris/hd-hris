import React from "react";
import { useRouter } from "next/navigation";
import FormFields from "@/components/common/forms/FormFields";
import { useFormContext } from "react-hook-form";
import { usePrivilegesData } from "@/services/queries";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@nextui-org/react";

interface EditAccountProps {
  userId: string;
  email: string;
  hasAccount: boolean;
  currentPrivilegeId?: string;
}

const EditAccount: React.FC<EditAccountProps> = ({
  userId,
  email,
  hasAccount,
  currentPrivilegeId,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const { setValue, getValues } = useFormContext();
  const { toast } = useToast();
  const { data: privileges = [] } = usePrivilegesData();

  React.useEffect(() => {
    if (currentPrivilegeId) {
      setValue("privilege_id", currentPrivilegeId);
    }
  }, [currentPrivilegeId, setValue]);

  const privilegeOptions = privileges.reduce((acc: any[], privilege) => {
    if (privilege && privilege.id && privilege.name) {
      acc.push({ value: privilege.id.toString(), label: privilege.name });
    }
    return acc;
  }, []);

  const handleResetPassword = async () => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `/api/employeemanagement/employees?id=${userId}&type=account`,
        {}
      );
      router.push("/employeemanagement/employees");
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          duration: 3000,
        });
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred";
      
      if (error.response?.status === 404) {
        errorMessage = "Employee not found";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "danger",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivilegeChange = async (privilegeId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `/api/employeemanagement/employees?id=${userId}&type=account`,
        { privilege_id: privilegeId }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          duration: 3000,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update privilege",
        variant: "danger",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Account Information</h2>
        {hasAccount && (
          <Button
            type="button"
            onPress={handleResetPassword}
            variant="bordered"
            isDisabled={isLoading}
          >
            Reset Password
          </Button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">Associated Email: {email}</p>
        <p className="text-sm text-gray-500">
          Account Status: {hasAccount ? "Active" : "No Account"}
        </p>
      </div>

      {hasAccount && (
        <div className="flex items-end space-x-4 mb-4">
          <div className="flex-grow">
            <FormFields
              items={[
                {
                  name: "privilege_id",
                  label: "Access Level",
                  type: "select",
                  isRequired: true,
                  config: {
                    placeholder: "Select access level",
                    options: privilegeOptions,
                    defaultValue: currentPrivilegeId,
                  },
                },
              ]}
            />
          </div>
          <Button
            type="button"
            color="primary"
            onPress={() => handlePrivilegeChange(getValues("privilege_id"))}
            isLoading={isLoading}
          >
            Update Privilege
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditAccount;