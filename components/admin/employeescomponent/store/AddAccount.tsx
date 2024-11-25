import React from 'react';
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { useFormContext } from "react-hook-form";

interface AddAccountProps {
  userId: string;
  email: string;
}

const AddAccount: React.FC<AddAccountProps> = () => {
  const formFields: FormInputProps[] = [
    {
      name: "username",
      type: "text",
      label: "Username",
      isRequired: true,
      config: {
        placeholder: "Enter username"
      }
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      isRequired: true,
      config: {
        placeholder: "Enter password"
      }
    }
  ];

  return <FormFields items={formFields} />;
};

export default AddAccount;