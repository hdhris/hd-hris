import React, { useState, useRef, useCallback, useEffect } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import {
  Avatar,
  Button,
  CalendarDate,
  DatePicker,
  Divider,
} from "@nextui-org/react";
import Text from "@/components/Text";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { parseDate } from "@internationalized/date";
import AddressInput from "@/components/common/forms/address/AddressInput";
import {LuUserCircle2} from "react-icons/lu";

interface AddressOption {
  address_code: number;
  address_name: string;
}

const safeParseDate = (dateString: string) => {
  try {
    return parseDate(dateString);
  } catch (error) {
    console.error("Date parsing error:", error);
    return null;
  }
};

const genderOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
];

const EditPersonalInformationForm: React.FC = () => {
  const { control, setValue, getValues } = useFormContext();
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined
  );
  const { edgestore } = useEdgeStore();
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null); 

  // Populate fields with initial data from the server
  useEffect(() => {
    const pictureValue = getValues("picture");
    const gender = getValues("gender");

    if (pictureValue) {
      setImagePreview(pictureValue);
    }

    if (gender) {
      setValue("gender", gender); // Set gender value
    }
  }, [getValues, setValue]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        setFileError("File size must be less than 5MB");
        return;
      }

      try {
        const res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            console.log(`Upload progress: ${progress}%`);
          },
        });

        setImagePreview(res.url);
        setValue("picture", res.url);
      } catch (error) {
        console.error("Error uploading file:", error);
        setFileError("Failed to upload image");
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = useCallback(() => {
    setImagePreview(undefined);
    fileInputRef.current!.value = "";
  }, []);

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="picture"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
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
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <Divider />
      <Text className="text-medium font-semibold">Basic Information</Text>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="first_name"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  isRequired
                  label={<span className="font-semibold">First Name</span>}
                  type="text"
                  labelPlacement="outside"
                  {...field}
                  placeholder="Enter first name"
                  variant="bordered"
                  isInvalid={(() => {
                    const value = field.value;
                    const validateText = (value: string) =>
                      /^[a-zA-Z\s]+$/.test(value); // Regex for alphabets only
                    return value === "" ? false : !validateText(value);
                  })()}
                  errorMessage="First name should contain only alphabets"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Controller
          name="middle_name"
          control={control}
          render={({ field }) => (
            <FormItem>
             
              <FormControl>
                <Input
                  {...field}
                  label={<span className="font-semibold">Middle Name</span>}
                  labelPlacement="outside"
                  placeholder="Enter middle name"
                  variant="bordered"
                  isInvalid={(() => {
                    const value = field.value;
                    const validateText = (value: string) =>
                      /^[a-zA-Z]*$/.test(value); // Optional field, alphabets only
                    return value === "" ? false : !validateText(value);
                  })()}
                  errorMessage="Middle name should contain only alphabets"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Controller
          name="last_name"
          control={control}
          render={({ field }) => (
            <FormItem>
             
              <FormControl>
                <Input
                  {...field}
                  isRequired
                  label={<span className="font-semibold">Last Name</span>}
                  type="text"
                  labelPlacement="outside"
                  placeholder="Enter last name"
                  variant="bordered"
                  isInvalid={(() => {
                    const value = field.value;
                    const validateText = (value: string) =>
                      /^[a-zA-Z]+$/.test(value); // Regex for alphabets only
                    return value === "" ? false : !validateText(value);
                  })()}
                  errorMessage="Last name should contain only alphabets"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Suffix */}
        <Controller
          name="suffix"
          control={control}
          render={({ field }) => (
            <FormItem>
             
              <FormControl>
                <Input
                  {...field}
                  label={<span className="font-semibold">Suffix</span>}
                  type="text"
                  labelPlacement="outside"
                  placeholder="Enter Suffix"
                  variant="bordered"
                  isInvalid={(() => {
                    const value = field.value;
                    const validateText = (value: string) =>
                      /^[a-zA-Z]*$/.test(value); // Optional field, alphabets only
                    return value === "" ? false : !validateText(value);
                  })()}
                  errorMessage="Suffix should contain only alphabets"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Extension */}
        <Controller
          name="extension"
          control={control}
          render={({ field }) => (
            <FormItem>
             
              <FormControl>
              <Input
                  {...field}
                  label={<span className="font-semibold">Extension</span>}
                  type="text"
                  labelPlacement="outside"
                  placeholder="Enter Extension"
                  variant="bordered"
                  isInvalid={(() => {
                    const value = field.value;
                    const validateText = (value: string) =>
                      /^[a-zA-Z]*$/.test(value); // Optional field, alphabets only
                    return value === "" ? false : !validateText(value);
                  })()}
                  errorMessage="Extension should contain only alphabets"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <FormItem>
             
              <FormControl>
                <Select
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    field.onChange(value);
                    setValue("gender", value); // Explicitly set the value
                  }}
                  isRequired
                  label={<span className="font-semibold">Gender</span>}
                  labelPlacement="outside"
                  placeholder="Select gender"
                  variant="bordered"
                >
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Controller
          name="birthdate"
          control={control}
          render={({ field }) => {
            const parsedValue = field.value ? safeParseDate(field.value) : null;

            return (
              <FormItem>
             
                <FormControl>
                  <DatePicker
                    value={parsedValue}
                    onChange={(date: CalendarDate | null) => {
                      field.onChange(date ? date.toString() : "");
                    }}
                    aria-label="Birthdate"
                    variant="bordered"
                    isRequired
                    label={<span className="font-semibold">Birthdate</span>}
                    labelPlacement="outside"
                    showMonthAndYearPickers
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
      <Divider />
      <Text className="text-medium font-semibold">Contact Information</Text>

      <div className="grid grid-cols-2 gap-4">
        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormItem>
        
              <FormControl>
                <Input
                  {...field}
                  isRequired
                  label={<span className="font-semibold">Email</span>}
                  labelPlacement="outside"
                  type="email"
                  isInvalid={(() => {
                    const value = field.value;

                    // Correct regex for email validation, made case-insensitive
                    const validateEmail = (value: string) =>
                      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);

                    // Check if value is empty, return false. Otherwise, check if it's a valid email
                    return value === "" ? false : !validateEmail(value);
                  })()}
                  placeholder="Enter email"
                  errorMessage="Please enter a valid email"
                  variant="bordered"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Number */}
        <Controller
          name="contact_no"
          control={control}
          render={({ field }) => (
            <FormItem>
        
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter phone number"
                  variant="bordered"
                  isRequired
                  label={<span className="font-semibold">Phone No.</span>}
                  labelPlacement="outside"
                  type="text"
                  value={field.value ? `+63${field.value}` : ""}
                  onChange={(e) => {
                    const rawPhone = e.target.value.replace(/^\+63/, "");
                    field.onChange(rawPhone);
                  }}
                  isInvalid={(() => {
                    const value = field.value;
                    const validatePhone = (value: string) =>
                      /^9\d{9}$/.test(value);
                    return value === "" ? false : !validatePhone(value);
                  })()}
                  errorMessage="Please enter a valid phone number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Divider />
      <Text className="text-medium font-semibold">Address Information</Text>

      <div className="grid grid-cols-2 gap-4">
        <AddressInput />
      </div>
    </div>
  );
};

export default EditPersonalInformationForm;
