import React, { useState, useRef, useCallback, useEffect } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Avatar, Button, DatePicker, Divider } from "@nextui-org/react";
import { UserRound } from "lucide-react";
import Text from "@/components/Text";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";

// Define the type for address options
interface AddressOption {
  address_code: number;
  address_name: string;
}

// Define gender options based on EmployeeAll type
const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const PersonalInformationForm: React.FC = () => {
  const { control, setValue } = useFormContext();
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined
  );

  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addressOptions, setAddressOptions] = useState<{
    region: AddressOption[];
    province: AddressOption[];
    municipal: AddressOption[];
    baranggay: AddressOption[];
  }>({
    region: [],
    province: [],
    municipal: [],
    baranggay: [],
  });

  // Watch selected values
  const selectedRegion = useWatch({ name: "addr_region" });
  const selectedProvince = useWatch({ name: "addr_province" });
  const selectedMunicipal = useWatch({ name: "addr_municipal" });

  // Fetch address options
  const fetchAddressOptions = async (
    parentCode: number | null,
    level: string
  ) => {
    try {
      const response = await axios.get<AddressOption[]>(
        `/api/employeemanagement/addresses?parentCode=${parentCode}`
      );
      setAddressOptions((prev) => ({ ...prev, [level]: response.data }));
    } catch (error) {
      console.error(`Error fetching ${level}:`, error);
    }
  };

  // Fetch regions on component mount
  useEffect(() => {
    fetchAddressOptions(0, "region");
  }, []);

  // Fetch provinces when a region is selected
  useEffect(() => {
    if (selectedRegion) {
      fetchAddressOptions(parseInt(selectedRegion as string), "province");
      setValue("addr_province", "");
      setValue("addr_municipal", "");
      setValue("addr_baranggay", "");
    }
  }, [selectedRegion, setValue]);

  // Fetch municipalities when a province is selected
  useEffect(() => {
    if (selectedProvince) {
      fetchAddressOptions(parseInt(selectedProvince as string), "municipal");
      setValue("addr_municipal", "");
      setValue("addr_baranggay", "");
    }
  }, [selectedProvince, setValue]);

  // Fetch barangays when a municipality is selected
  useEffect(() => {
    if (selectedMunicipal) {
      fetchAddressOptions(parseInt(selectedMunicipal as string), "baranggay");
      setValue("addr_baranggay", "");
    }
  }, [selectedMunicipal, setValue]);

  // Handle image change
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
        {/* Region */}
        <Controller
          name="addr_region"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  placeholder="Select region"
                  onChange={(value) => {
                    field.onChange(value);
                    setValue("addr_province", "");
                    setValue("addr_municipal", "");
                    setValue("addr_baranggay", "");
                  }}
                >
                  {addressOptions.region.map((option) => (
                    <SelectItem
                      key={option.address_code}
                      value={option.address_code}
                    >
                      {option.address_name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Province */}
        <Controller
          name="addr_province"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  placeholder="Select province"
                  onChange={(value) => {
                    field.onChange(value);
                    setValue("addr_municipal", "");
                    setValue("addr_baranggay", "");
                  }}
                >
                  {addressOptions.province.map((option) => (
                    <SelectItem
                      key={option.address_code}
                      value={option.address_code}
                    >
                      {option.address_name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Municipal */}
        <Controller
          name="addr_municipal"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Municipal</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  placeholder="Select municipal"
                  onChange={(value) => {
                    field.onChange(value);
                    setValue("addr_baranggay", "");
                  }}
                >
                  {addressOptions.municipal.map((option) => (
                    <SelectItem
                      key={option.address_code}
                      value={option.address_code}
                    >
                      {option.address_name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Baranggay */}
        <Controller
          name="addr_baranggay"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Baranggay</FormLabel>
              <FormControl>
                <Select {...field} placeholder="Select baranggay">
                  {addressOptions.baranggay.map((option) => (
                    <SelectItem
                      key={option.address_code}
                      value={option.address_code}
                    >
                      {option.address_name}
                    </SelectItem>
                  ))}
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
