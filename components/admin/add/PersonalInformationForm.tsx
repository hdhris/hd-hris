import React, { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { Avatar, Button, Divider } from "@nextui-org/react";
import Text from "@/components/Text";
import { LuUserCircle2 } from "react-icons/lu";
import AddressInput from "@/components/common/forms/address/AddressInput";

const genderOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
];

const PersonalInformationForm: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined
  );
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm();
  const { setValue } = form;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        setFileError("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue("picture", file);
      };
      reader.readAsDataURL(file);
      setFileError("");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = useCallback(() => {
    setImagePreview(undefined);
    setValue("picture", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setValue]);

  const formFields: FormInputProps[] = [
    {
      name: "first_name",
      label: "First Name",
      type: "text",
      isRequired: true,
      config: {
        isRequired: true,
        placeholder: "Enter first name",
      },
    },
    {
      name: "middle_name",
      label: "Middle Name",
      type: "text",
      config: {
        placeholder: "Enter middle name",
      },
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text",
      isRequired: true,
      config: {
        isRequired: true,
        placeholder: "Enter last name",
      },
    },
    {
      name: "suffix",
      label: "Suffix",
      type: "text",
      config: {
        placeholder: "Enter Suffix",
      },
    },
    {
      name: "extension",
      label: "Extension",
      type: "text",
      config: {
        placeholder: "Enter Extension",
      },
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      isRequired: true,
      config: {
        placeholder: "Select gender",
        options: genderOptions,
      },
    },
    {
      name: "birthdate",
      label: "Birthdate",
      type: "date-picker",
      isRequired: true,
      config: {
        placeholder: "Select birthdate",
      },
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      isRequired: true,
      config: {
        isRequired: true,
        placeholder: "Enter email",
      },
    },
    {
      name: "contact_no",
      label: "Phone Number",
      type: "tel",
      isRequired: true,
      config: {
        isRequired: true,
        placeholder: "Enter phone number",
        startContent: <span className="text-default-400 text-small">+63</span>,
      },
    },
  ];

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text className="font-semibold mb-2">Profile Image</Text>
          <div className="flex items-center gap-2">
            <Avatar
              src={imagePreview || undefined}
              className="w-20 h-20 text-large cursor-pointer"
              onClick={handleAvatarClick}
              showFallback
              fallback={
                <LuUserCircle2 className="w-12 h-12 text-default-500" />
              }
              isBordered={!!fileError}
              color={fileError ? "danger" : "default"}
            />
            <div className="flex flex-col gap-2">
              <Text className="text-sm">Upload your photo</Text>
              <Text className="italic text-xs text-gray-500">
                {fileError || "Pick a profile picture under 5MB"}
              </Text>
              <div className="space-x-2">
                <Button
                  size="sm"
                  radius="md"
                  variant="bordered"
                  as="label"
                  htmlFor="dropzone-file"
                >
                  <input
                    ref={fileInputRef}
                    id="dropzone-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  Upload a picture
                </Button>
                {imagePreview && (
                  <Button
                    size="sm"
                    radius="md"
                    color="danger"
                    onClick={handleRemovePhoto}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Divider />
      <Text className="text-medium font-semibold">Basic Information</Text>

      <FormFields items={formFields} />

      <Divider />
      <Text className="text-medium font-semibold">Address</Text>

      <div className="grid grid-cols-2 gap-4">
        <AddressInput />
      </div>
    </form>
  );
};

export default PersonalInformationForm;
