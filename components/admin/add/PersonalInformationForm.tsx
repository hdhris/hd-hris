import React, { useState, useRef, useCallback } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Avatar, Button, DatePicker, Divider } from "@nextui-org/react";
import { UserRound } from "lucide-react";
import Text from "@/components/Text";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const PersonalInformationForm: React.FC = () => {
  const { control, setValue } = useFormContext();
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

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>Profile Image</FormLabel>
          <FormControl>
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
          </FormControl>
        </FormItem>

        {/* ID */}
        <Controller
          name="ID"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter ID" variant="bordered" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Divider />
      <Text className="text-medium font-semibold">Basic Information</Text>

      <div className="grid grid-cols-2 gap-4">
        {/* First Name */}
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter first name" variant="bordered" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Middle Name */}
        <Controller
          name="middleName"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter middle name" variant="bordered" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter last name" variant="bordered" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <Select {...field} placeholder="Select gender" variant="bordered">
                  <SelectItem key="male" value="Male">Male</SelectItem>
                  <SelectItem key="female" value="Female">Female</SelectItem>
                  <SelectItem key="other" value="Other">Other</SelectItem>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Birthdate */}
        <Controller
          name="birthdate"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birthdate</FormLabel>
              <FormControl>
                <DatePicker
                  onChange={field.onChange}
                  aria-label="Birth Date"
                  variant="bordered"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
                <Input {...field} placeholder="Enter email" variant="bordered" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Number */}
        <Controller
          name="phoneNo"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone No.</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter phone number" variant="bordered" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Divider />
      <Text className="text-medium font-semibold">Address Information</Text>

      <div className="grid grid-cols-2 gap-4">
        {/* Region */}
        <Controller
          name="region"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <FormControl>
                <Select {...field} placeholder="Select region" variant="bordered">
                  <SelectItem key="region1" value="Region 1">Region 1</SelectItem>
                  <SelectItem key="region2" value="Region 2">Region 2</SelectItem>
                  <SelectItem key="region3" value="Region 3">Region 3</SelectItem>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Province */}
        <Controller
          name="province"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <FormControl>
                <Select {...field} placeholder="Select province" variant="bordered">
                  <SelectItem key="province1" value="Province 1">Province 1</SelectItem>
                  <SelectItem key="province2" value="Province 2">Province 2</SelectItem>
                  <SelectItem key="province3" value="Province 3">Province 3</SelectItem>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City */}
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City/Municipality</FormLabel>
              <FormControl>
                <Select {...field} placeholder="Select city/municipality" variant="bordered">
                  <SelectItem key="city1" value="City 1">City 1</SelectItem>
                  <SelectItem key="city2" value="City 2">City 2</SelectItem>
                  <SelectItem key="city3" value="City 3">City 3</SelectItem>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default PersonalInformationForm;
