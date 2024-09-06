import React, { useState, useRef, useCallback } from "react";
import { useForm, FormProvider, ControllerRenderProps, FieldValues } from "react-hook-form";
import FormFields from "@/components/forms/FormFields";
import { Selection } from "@/components/forms/FormFields";
import { Avatar, DatePicker, Button, Divider } from "@nextui-org/react";
import { UserRound } from "lucide-react";
import Text from "@/components/Text";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {cn, icon_color} from "@/lib/utils";

type FormValues = {
  profileImage: FileList | undefined;
  ID: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  gender: string;
  birthdate: Date;
  phoneNo: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  streetOrPurok: string;
};

const formSchema = z.object({
  profileImage: z.instanceof(FileList).optional(),
  ID: z.number().min(1, { message: "ID is required." }),
  firstName: z.string().min(2, { message: "First Name must be at least 2 characters." }),
  middleName: z.string().optional(),
  lastName: z.string().min(2, { message: "Last Name must be at least 2 characters." }),
  email: z.string().email("Invalid email address."),
  gender: z.enum(["Male", "Female", "Other"]),
  birthdate: z.coerce.date(),
  phoneNo: z.string().min(10, { message: "Phone No. must be at least 10 digits." }),
  region: z.string(),
  province: z.string(),
  city: z.string(),
  barangay: z.string(),
  streetOrPurok: z.string(),
});

const PersonalInformationForm: React.FC = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  
  const { control } = methods;
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    fileInputRef.current!.value = "";
  }, []);

  const sections = {
    profile: [
      {
        name: "profileImage",
        label: "Profile Image",
        Component: () => (
          <div className="flex items-center gap-2">
            <Avatar
              src={imagePreview || undefined}
              className="w-20 h-20 text-large cursor-pointer"
              onClick={handleAvatarClick}
              showFallback
              fallback={<UserRound className="w-12 h-12 text-default-500" />}
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
                    aria-label="tag"
                    ref={fileInputRef}
                    id="dropzone-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  Upload New Picture
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
        ),
      },
      { name: "ID", label: "ID", placeholder: "Enter ID", isRequired: true },
    ],
    basicInformation: [
      {
        name: "firstName",
        label: "First Name",
        placeholder: "Enter first name",
        isRequired: true,
      },
      {
        name: "middleName",
        label: "Middle Name",
        placeholder: "Enter middle name",
      },
      {
        name: "lastName",
        label: "Last Name",
        placeholder: "Enter last name",
        isRequired: true,
      },
      {
        name: "gender",
        label: "Gender",
        placeholder: "Select gender",
        isRequired: true,
        Component: (field: ControllerRenderProps<FieldValues, string>) => (
          <Selection
            {...field}
            items={["Male", "Female", "Other"]}
            placeholder="Select gender"
          />
        ),
      },
      {
        name: "birthdate",
        label: "Birthdate",
        placeholder: "Select birthdate",
        isRequired: true,
        Component: (field: ControllerRenderProps<FieldValues, string>) => (
          <DatePicker
          onChange={field.onChange}
          aria-label="Birth Date"
          variant="bordered"
          radius="sm"
          classNames={{selectorIcon: icon_color}}
          color="primary"
          showMonthAndYearPickers
          />
        ),
      },
    ],
    contactInformation: [
      {
        name: "email",
        label: "Email",
        placeholder: "Enter email",
        type: "email",
        isRequired: true,
      },
      {
        name: "phoneNo",
        label: "Phone No.",
        placeholder: "Enter phone number",
        isRequired: true,
        type: "tel",
      },
    ],
    addressInformation: [
      {
        name: "region",
        label: "Region",
        placeholder: "Select region",
        isRequired: true,
        Component: (field: ControllerRenderProps<FieldValues, string>) => (
          <Selection
            {...field}
            items={["Region 1", "Region 2", "Region 3"]}
            placeholder="Select region"
          />
        ),
      },
      {
        name: "province",
        label: "Province",
        placeholder: "Select province",
        isRequired: true,
        Component: (field: ControllerRenderProps<FieldValues, string>) => (
          <Selection
            {...field}
            items={["Province 1", "Province 2", "Province 3"]}
            placeholder="Select province"
          />
        ),
      },
      {
        name: "city",
        label: "City/Municipality",
        placeholder: "Select city/municipality",
        isRequired: true,
        Component: (field: ControllerRenderProps<FieldValues, string>) => (
          <Selection
            {...field}
            items={["City 1", "City 2", "City 3"]}
            placeholder="Select city/municipality"
          />
        ),
      },
      {
        name: "barangay",
        label: "Barangay",
        placeholder: "Select barangay",
        isRequired: true,
        Component: (field: ControllerRenderProps<FieldValues, string>) => (
          <Selection
            {...field}
            items={["Barangay 1", "Barangay 2", "Barangay 3"]}
            placeholder="Select barangay"
          />
        ),
      },
      {
        name: "streetOrPurok",
        label: "Street/Purok",
        placeholder: "Enter street/purok",
        isRequired: true,
      },
    ],
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="grid grid-cols-2 gap-4">
          <FormFields items={sections.profile} />
        </div>

        {/* Divider */}
        <Divider />
        <Text className="text-medium font-semibold">Basic Information</Text>

        {/* Basic Information Section */}
        <div className="grid grid-cols-2 gap-4">
          <FormFields items={sections.basicInformation} />
        </div>

        {/* Divider */}
        <Divider />
        <Text className="text-medium font-semibold">Contact Information</Text>

        {/* Contact Information Section */}
        <div className="grid grid-cols-2 gap-4">
          <FormFields items={sections.contactInformation} />
        </div>

        {/* Divider */}
        <Divider />
        <Text className="text-medium font-semibold">Address Information</Text>

        {/* Address Information Section */}
        <div className="grid grid-cols-2 gap-4">
          <FormFields items={sections.addressInformation} />
        </div>
      </div>
    </FormProvider>
  );
};

export default PersonalInformationForm;
