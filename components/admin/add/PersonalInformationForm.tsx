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
import { UserRound } from "lucide-react";
import Text from "@/components/Text";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { parseDate } from "@internationalized/date";
import AddressInput from "@/components/common/forms/address/AddressInput";


const safeParseDate = (dateString: string) => {
  try {
    return parseDate(dateString);
  } catch (error) {
    console.error("Date parsing error:", error);
    return null;
  }
};

// Define gender options based on EmployeeAll type
const genderOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
];

const PersonalInformationForm: React.FC = () => {
  const { control, setValue } = useFormContext();
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined
  );
  const { edgestore } = useEdgeStore();

  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
 

  // Handle image change
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        setFileError("File size must be less than 5MB");
        return;
      }

      try {
        // Upload file to EdgeStore
        const res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            // Handle upload progress if needed
            console.log(`Upload progress: ${progress}%`);
          },
        });

        console.log("File uploaded successfully:", res.url);

        // Set the URL of the uploaded file
        setImagePreview(res.url);
        setValue("picture", res.url); // Assuming 'picture' is the field name in your form
      } catch (error) {
        console.error("Error uploading file:", error);
        setFileError("Failed to upload image");
      }
    }
  };

  useEffect(() => {
    console.log("Image preview updated:", imagePreview);
  }, [imagePreview]);

  // Handle avatar click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle removing photo
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
                      <UserRound className="w-12 h-12 text-default-500" />
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
        {/* First Name */}
        <Controller
          name="first_name"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter first name"
                  variant="bordered"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* First Name */}
        <Controller
          name="middle_name"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter middle name"
                  variant="bordered"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <Controller
          name="last_name"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter last name"
                  variant="bordered"
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
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <Select
                  {...field}
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
        {/* Birth Date */}
        <Controller
          name="birthdate"
          control={control}
          render={({ field }) => {
            const parsedValue = field.value ? safeParseDate(field.value) : null;

            return (
              <FormItem>
                <FormLabel> Birthdate</FormLabel>
                <FormControl>
                  <DatePicker
                    value={parsedValue}
                    onChange={(date: CalendarDate | null) => {
                      field.onChange(date ? date.toString() : "");
                    }}
                    aria-label="Birthdate"
                    variant="bordered"
                    className="border rounded"
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter email"
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
              <FormLabel>Phone No.</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter phone number"
                  variant="bordered"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Divider />
      <Text className="text-medium font-semibold">Address</Text>

      <div className="grid grid-cols-2 gap-4">
      <AddressInput />
      </div>
    </div>
  );
};

export default PersonalInformationForm;
