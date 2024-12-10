// components/admin/employeescomponent/update/EditAccountForm.tsx
import React from 'react';
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";

interface EditAccountProps {
  userId: string;
  email: string;
}

const EditAccountForm: React.FC<EditAccountProps> = () => {
  const [showResetPassword, setShowResetPassword] = React.useState(false);

  const formFields: FormInputProps[] = [
    {
      name: "username",
      type: "text" as const,
      label: "Username",
      isRequired: true,

      config: {
        placeholder: "Enter username",
        isDisabled:true,
        variant:"underlined"
      }
    },
    ...(showResetPassword ? [
      {
        name: "password",
        type: "password" as const,
        label: "Password",
        isRequired: true,
        config: {
          placeholder: "Enter password",
          defaultValue: "password"
        }
      }
    ] : [])
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Account Information</h2>
        {!showResetPassword && (
          <Button 
            type="button"
            onClick={() => setShowResetPassword(true)}
            variant="outline"
          >
            Reset Password
          </Button>
        )}
      </div>
      
      <FormFields items={formFields} />
      
      {showResetPassword && (
        <div className="flex gap-2 justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowResetPassword(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditAccountForm;