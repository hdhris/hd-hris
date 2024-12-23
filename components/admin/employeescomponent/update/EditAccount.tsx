import React from "react";
import { useRouter } from "next/navigation";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
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
  const [showResetPassword, setShowResetPassword] = React.useState(false);
  const [showCreateAccount, setShowCreateAccount] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPrivilegeUpdating, setIsPrivilegeUpdating] = React.useState(false);
  const { setValue, formState: { errors }, getValues, reset } = useFormContext();
  const { toast } = useToast();
  const { data: privileges = [] } = usePrivilegesData();

  // Initialize current privilege ID in form
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

  const formFields: FormInputProps[] = React.useMemo(() => {
    if (showCreateAccount) {
      return [
        {
          name: "username",
          type: "text",
          label: "Username",
          isRequired: true,
          config: {
            placeholder: "Enter username",
            errorMessage: errors.username?.message as string,
          },
        },
        {
          name: "password",
          type: "text",
          label: "Password",
          isRequired: true,
          config: {
            placeholder: "Create password",
            errorMessage: errors.password?.message as string,
            defaultValue: "password",
            minLength: 8,  // Add minimum length
            pattern: "^.{8,}$", // Regex pattern for 8 or more characters
            validation: (value: string) => {
              if (value.length < 8) {
                return "Password must be at least 8 characters long";
              }
              return true;
            }
          },
        },
        {
          name: "privilege_id",
          label: "Access Level",
          type: "select",
          isRequired: true,
          config: {
            placeholder: "Select access level",
            options: privilegeOptions,
          },
        },
      ];
    }

    if (showResetPassword) {
      return [
        {
          name: "password",
          type: "text",  
          label: "New Password",
          isRequired: true,
          config: {
            placeholder: "Enter new password",
            errorMessage: errors.password?.message as string,
            defaultValue: "password",
            minLength: 8,  // Add minimum length
            pattern: "^.{8,}$", // Regex pattern for 8 or more characters
            validation: (value: string) => {
              if (value.length < 8) {
                return "Password must be at least 8 characters long";
              }
              return true;
            }
          },
        },
      ];
    }

    return [];
  }, [showCreateAccount, showResetPassword, errors, privilegeOptions]);

  const handleShowForm = () => {
    if (!hasAccount) {
      setShowCreateAccount(true);
      setShowResetPassword(false);
      setValue("isNewAccount", true);
      setValue("isPasswordModified", true);
      setValue("password", "password");
      setValue("privilege_id", "");
    } else {
      setShowResetPassword(true);
      setShowCreateAccount(false);
      setValue("isNewAccount", false);
      setValue("isPasswordModified", true);
      setValue("password", "password");  
    }
  };

  const handleCancel = () => {
    if (isLoading) return;
    setShowResetPassword(false);
    setShowCreateAccount(false);
    reset({
      username: getValues("username"),
      privilege_id: getValues("privilege_id"),
      password: "",
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const accountData = showCreateAccount 
        ? {
            username: getValues("username"),
            privilege_id: getValues("privilege_id"),
            password: getValues("password"),
          }
        : {
            password: getValues("password"),
          };
  
      const response = await axios.put(
        `/api/employeemanagement/employees?id=${userId}&type=account`,
        accountData
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          duration: 3000,
        });

        setShowResetPassword(false);
        setShowCreateAccount(false);
        setValue("password", "");

        // Wait for toast before redirect
        setTimeout(() => {
          router.push("/employeemanagement/employees");
        }, 1500);
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred";
      
      if (error.response?.status === 404) {
        errorMessage = "Employee not found";
      } else if (error.response?.status === 409) {
        errorMessage = "Username already exists";
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
      setIsPrivilegeUpdating(true);
      const response = await axios.put(
        `/api/employeemanagement/employees?id=${userId}&type=account`,
        { privilege_id: privilegeId }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Privilege updated successfully",
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
      setIsPrivilegeUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Account Information</h2>
        {!showResetPassword && !showCreateAccount && (
          <Button
            type="button"
            onPress={handleShowForm}
            variant="bordered"
            isDisabled={isLoading}
          >
            {!hasAccount ? "Create Account" : "Reset Password"}
          </Button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">Associated Email: {email}</p>
        <p className="text-sm text-gray-500">
          Account Status: {hasAccount ? "Active" : "No Account"}
        </p>
        {hasAccount && (
          <p className="text-sm text-gray-500">
            Username: {getValues("username")}
          </p>
        )}
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
            isLoading={isPrivilegeUpdating}
          >
            Update Privilege
          </Button>
        </div>
      )}

      {(showResetPassword || showCreateAccount) && (
        <>
          <FormFields items={formFields} />
          <div className="flex gap-2 justify-end mt-4">
            <Button
              type="button"
              variant="bordered"
              color="primary"
              onPress={handleCancel}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              color="primary"
              onPress={handleSubmit}
              isLoading={isLoading}
              isDisabled={isLoading || (showCreateAccount && !getValues("username"))}
            >
              {showCreateAccount ? "Create Account" : "Reset Password"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditAccount;