"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { Avatar, Button, Divider } from "@nextui-org/react";
import Text from "@/components/Text";
import { LuUserCircle2 } from "react-icons/lu";
import AddressInput from "@/components/common/forms/address/AddressInput";
import { parseAbsoluteToLocal } from "@internationalized/date";
import { toGMT8 } from "@/lib/utils/toGMT8";
import dayjs from "dayjs";

const genderOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
];

const suffixOptions = [
  { value: "Jr.", label: "Jr." },
  { value: "Sr.", label: "Sr." },
  { value: "I", label: "I" },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
  { value: "V", label: "V" },
  { value: "VI", label: "VI" },
  { value: "VII", label: "VII" },
  { value: "VIII", label: "VIII" },
  { value: "IX", label: "IX" },
  { value: "X", label: "X" },
];

const prefixOptions = [
  { value: "Mr.", label: "Mr." },
  { value: "Ms.", label: "Ms." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Dr.", label: "Dr." },
  { value: "Prof.", label: "Prof." },
  { value: "Hon.", label: "Hon." },
  { value: "Rev.", label: "Rev." },
  { value: "Capt.", label: "Capt." },
  { value: "Lt.", label: "Lt." },
  { value: "Maj.", label: "Maj." },
  { value: "Col.", label: "Col." },
  { value: "Gen.", label: "Gen." },
  { value: "Engr.", label: "Engr." },
  { value: "Arch.", label: "Arch." },
  { value: "Sir", label: "Sir" },
  { value: "Dame", label: "Dame" },
  { value: "Lady", label: "Lady" },
  { value: "Lord", label: "Lord" },
  { value: "Mx.", label: "Mx." },
  { value: "Master", label: "Master" },
];

const extensionOptions = [
  { value: "A.C.A.", label: "A.C.A." },
  { value: "A.C.C.", label: "A.C.C." },
  { value: "A.I.C.P.", label: "A.I.C.P." },
  { value: "A.R.A.", label: "A.R.A." },
  { value: "ATTY.", label: "ATTY." },
  { value: "B.A.", label: "B.A." },
  { value: "B.Sc.", label: "B.Sc." },
  { value: "C.A.", label: "C.A." },
  { value: "C.E.O.", label: "C.E.O." },
  { value: "C.F.O.", label: "C.F.O." },
  { value: "C.T.O.", label: "C.T.O." },
  { value: "C.P.A.", label: "C.P.A." },
  { value: "C.P.E.", label: "C.P.E." },
  { value: "C.S.", label: "C.S." },
  { value: "C.S.C.S.", label: "C.S.C.S." },
  { value: "C.W.E.", label: "C.W.E." },
  { value: "D.M.D.", label: "D.M.D." },
  { value: "D.O.", label: "D.O." },
  { value: "D.V.M.", label: "D.V.M." },
  { value: "D.R.N.", label: "D.R.N." },
  { value: "Esq.", label: "Esq." },
  { value: "F.C.P.A.", label: "F.C.P.A." },
  { value: "F.R.C.S.", label: "F.R.C.S." },
  { value: "I.T.", label: "I.T." },
  { value: "J.D.", label: "J.D." },
  { value: "LL.B.", label: "LL.B." },
  { value: "LL.M.", label: "LL.M." },
  { value: "M.A.", label: "M.A." },
  { value: "M.B.A.", label: "M.B.A." },
  { value: "M.D.", label: "M.D." },
  { value: "M.E.", label: "M.E." },
  { value: "M.S.", label: "M.S." },
  { value: "M.S.W.", label: "M.S.W." },
  { value: "N.P.", label: "N.P." },
  { value: "Ph.D.", label: "Ph.D." },
  { value: "P.E.", label: "P.E." },
  { value: "P.L.C.", label: "P.L.C." },
  { value: "P.M.P.", label: "P.M.P." },
  { value: "Prof.", label: "Prof." },
  { value: "R.N.", label: "R.N." },
  { value: "R.P.", label: "R.P." },
  { value: "S.C.", label: "S.C." },
  { value: "Sr.", label: "Sr." },
  { value: "V.P.", label: "V.P." },
  { value: "A.B.D.", label: "A.B.D." },
  { value: "C.H.A.", label: "C.H.A." },
  { value: "C.H.R.M.", label: "C.H.R.M." },
  { value: "C.N.P.", label: "C.N.P." },
  { value: "C.R.N.A.", label: "C.R.N.A." },
  { value: "C.T.A.", label: "C.T.A." },
  { value: "D.C.", label: "D.C." },
  { value: "D.P.M.", label: "D.P.M." },
  { value: "L.C.S.W.", label: "L.C.S.W." },
  { value: "M.P.H.", label: "M.P.H." },
  { value: "M.S.N.", label: "M.S.N." },
  { value: "MIT", label: "MIT" },
  { value: "P.A.", label: "P.A." },
  { value: "R.N.C.", label: "R.N.C." },
  { value: "S.C.C.", label: "S.C.C." },
  { value: "T.E.", label: "T.E." },
];

const PersonalInformationForm = () => {
  const { setValue, watch } = useFormContext();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch the picture value to sync with form state
  const pictureValue = watch("picture");

  // Sync imagePreview with form state
  useEffect(() => {
    if (typeof pictureValue === "string" && pictureValue !== "") {
      setImagePreview(pictureValue);
    } else if (pictureValue instanceof File) {
      setImagePreview(URL.createObjectURL(pictureValue));
    } else {
      setImagePreview(null);
    }
  }, [pictureValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        setFileError("File size must be less than 5MB");
        return;
      }
      setValue("picture", file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = useCallback(() => {
    setImagePreview(null);
    setValue("picture", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setValue]);

  const formNameFields: FormInputProps[] = [
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
      label: <div className="mt-2">Middle Name</div>,
      type: "text",
      config: {
        placeholder: "Enter middle name",
        className: "pt-1",
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
  ];

  const formSEFields: FormInputProps[] = [
    {
      name: "prefix",
      label: "Prefix",
      type: "auto-complete",
      config: {
        placeholder: "Enter Prefix",
        options: prefixOptions,
        allowsCustomValue: true,
        
      },
    },
    {
      name: "suffix",
      label: "Suffix",
      type: "auto-complete",
      config: {
        placeholder: "Enter Suffix",
        options: suffixOptions,
        allowsCustomValue: true,
      },
    },
    {
      name: "extension",
      label: "Extension",
      type: "auto-complete",
      config: {
        placeholder: "Enter Extension",
        options: extensionOptions,
        allowsCustomValue: true,
      },
    },
  ];

  const formGBFields: FormInputProps[] = [
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
        maxValue: parseAbsoluteToLocal(dayjs().subtract(18, 'years').endOf('day').toISOString()),
        validationState: "valid",
        showMonthAndYearPickers: true
      },
    }
  ];

  const formcontactFields: FormInputProps[] = [
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

  const fathersBackground: FormInputProps[] = [
    {
      name: "fathers_first_name",
      label: "Father's First Name",
      type: "text",
      config: {
        placeholder: "Enter the employee's father's first name",
      },
    },
    {
      name: "fathers_middle_name",
      label: "Father's middle name",
      type: "text",
      config: {
        placeholder: "Enter the employee's father's middle name",
      },
    },
    {
      name: "fathers_last_name",
      label: "Father's last name",
      type: "text",
      config: {
        placeholder: "Enter the employee's father's last name",
      },
    },
  ];

  const mothersBackground: FormInputProps[] = [
    {
      name: "mothers_first_name",
      label: "Mother's First Name",
      type: "text",
      config: {
        placeholder: "Enter the employee's mother's first name",
      },
    },

    {
      name: "mothers_middle_name",
      label: "Mother's maiden middle name",
      type: "text",
      config: {
        placeholder: "Enter the employee's mother's maiden middle name",
      },
    },
    {
      name: "mothers_last_name",
      label: "Mother's maiden last name",
      type: "text",
      config: {
        placeholder: "Enter the employee's mother's maiden last name",
      },
    },
  ];

  const guardiansBackground: FormInputProps[] = [
    {
      name: "guardian_first_name",
      label: "Guardian's First Name",
      type: "text",
      config: {
        placeholder: "Enter the employee's guardian's first name",
      },
    },

    {
      name: "guardian_middle_name",
      label: "Guardian's middle name",
      type: "text",
      config: {
        placeholder: "Enter the employee's guardian's middle name",
      },
    },
    {
      name: "guardian_last_name",
      label: "Guardian's last name",
      type: "text",
      config: {
        placeholder: "Enter the employee's guardian's last name",
      },
    },
  ];

  return (
    <div className="space-y-6">
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
                    onPress={handleRemovePhoto}
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
      <div className="grid grid-cols-3 gap-4">
        <FormFields items={formNameFields} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormFields items={formSEFields} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormFields items={formGBFields} />
      </div>
      <Divider />
      <Text className="text-medium font-semibold">Contact</Text>
      <div className="grid grid-cols-2 gap-4">
        <FormFields items={formcontactFields} />
      </div>

      <Divider />
      <Text className="text-medium font-semibold">Address</Text>

      <div className="grid grid-cols-2 gap-4">
        <AddressInput />
      </div>

      <Divider />
      <Text className="text-medium font-semibold pb-2">Family background</Text>
      <Text className="text-medium font-semibold">{"Father's name"}</Text>
      <div className="grid grid-cols-3 gap-4">
        <FormFields items={fathersBackground} />
      </div>
      <Text className="text-medium font-semibold">
        {"Mother's maiden name"}
      </Text>
      <div className="grid grid-cols-3 gap-4">
        <FormFields items={mothersBackground} />
      </div>
      <Text className="text-medium font-semibold">{"Guardian's name"}</Text>
      <div className="grid grid-cols-3 gap-4">
        <FormFields items={guardiansBackground} />
      </div>
    </div>
  );
};

export default PersonalInformationForm;
