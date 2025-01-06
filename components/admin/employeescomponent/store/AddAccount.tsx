"use client";
import React from "react";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { usePrivilegesData } from "@/services/queries";

interface AddAccountProps {
  userId: string;
  email: string;
}

const AddAccount: React.FC<AddAccountProps> = ({ userId, email }) => {
  const { data: privileges = [] } = usePrivilegesData();

  const privilegeOptions = privileges.reduce((acc: any[], privilege) => {
    if (privilege && privilege.id && privilege.name) {
      acc.push({ value: privilege.id.toString(), label: privilege.name });
    }
    return acc;
  }, []);

  const formFields: FormInputProps[] = [
    {
      name: "privilege_id",
      label: "Access Level",
      type: "select",
      isRequired: true,
      config: {
        placeholder: "Select access level",
        options: privilegeOptions,
      }
    }
  ];

  return <FormFields items={formFields} />;
};

export default AddAccount;