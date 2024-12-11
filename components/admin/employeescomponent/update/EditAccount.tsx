import React from "react";
import { useRouter } from "next/navigation";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

interface EditAccountProps {
  userId: string;
  email: string;
}

const EditAccount: React.FC<EditAccountProps> = ({ userId, email }) => {
  const router = useRouter();
  const [showResetPassword, setShowResetPassword] = React.useState(false);
  const [showCreateAccount, setShowCreateAccount] = React.useState(false);
  const { setValue, formState: { errors }, getValues, reset } = useFormContext();
  const { toast } = useToast();

  const formFields: FormInputProps[] = showResetPassword || showCreateAccount ? [
    {
      name: "username",
      type: "text" as const,
      label: "Username",
      isRequired: showCreateAccount,
      config: {
        placeholder: "Enter username",
        errorMessage: errors.username?.message as string,
      },
    },
    {
      name: "password",
      type: "password" as const,
      label: getValues("isNewAccount") ? "Password" : "New Password",
      isRequired: true,
      config: {
        placeholder: getValues("isNewAccount") ? "Create password" : "Enter new password",
        errorMessage: errors.password?.message as string,
      },
    }
  ] : [];

  const handleShowForm = () => {
    const hasUsername = !!getValues('username');
    if (!hasUsername) {
      // If there's no existing username, show the create account form
      setShowCreateAccount(true);
      setShowResetPassword(false);
      setValue('isNewAccount', true);
      setValue('isPasswordModified', true);
      setValue('password', ''); // Clear the password field
    } else {
      // Otherwise, show the reset password form
      setShowResetPassword(true);
      setShowCreateAccount(false);
      setValue('isNewAccount', false);
      setValue('isPasswordModified', true);
      setValue('password', ''); // Clear the password field
    }
  };
  const handleCancel = () => {
    // Redirect to employees management page
    router.push("/employeemanagement/employees");
  };

  const handleSubmit = async () => {
    try {
      const accountData = {
        username: getValues("username"),
        password: getValues("password"),
      };

      const response = await axios.put(
        `/api/employeemanagement/employees?id=${userId}&type=account`,
        accountData
      );

      if (response.data.success) {
        // Redirect after successful submission
        router.push("/employeemanagement/employees");
        
        // Show success toast
        toast({
          title: "Success",
          description: "Employee information updated successfully!",
          duration: 3000,
        });

        // Clear the password field after successful submission
        setValue('password', '');
      } else {
        toast({
          title: "Error",
          description: response.data.message,
          variant: "danger",
          duration: 5000,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update account",
        variant: "danger",
        duration: 5000,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Account Information</h2>
        {!showResetPassword && !showCreateAccount && (
          <Button
            type="button"
            onClick={handleShowForm}
            variant="outline"
          >
            {!getValues("username") ? "Create Account" : "Reset Password"}
          </Button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">Associated Email: {email}</p>
        <p className="text-sm text-gray-500">
          Account Status: {getValues("username") ? "Active" : "No Account"}
        </p>
        {getValues("username") && (
          <p className="text-sm text-gray-500">
            Username: {getValues("username")}
          </p>
        )}
      </div>

      {(showResetPassword || showCreateAccount) && (
        <>
          <FormFields items={formFields} />
          <div className="flex gap-2 justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel {showCreateAccount ? "Account Creation" : "Password Reset"}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={showCreateAccount && !getValues("username")}
            >
              {showCreateAccount ? "Create Account" : "Reset account"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditAccount;