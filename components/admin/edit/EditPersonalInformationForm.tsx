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

  const [loadingState, setLoadingState] = useState({
    region: false,
    province: false,
    municipal: false,
    baranggay: false,
  });

  const selectedRegion = useWatch({ control, name: "addr_region" });
  const selectedProvince = useWatch({ control, name: "addr_province" });
  const selectedMunicipal = useWatch({ control, name: "addr_municipal" });

  const fetchAddressOptions = useCallback(
    async (parentCode: number | null, level: keyof typeof addressOptions) => {
      setLoadingState((prev) => ({ ...prev, [level]: true }));
      try {
        const response = await axios.get<AddressOption[]>(
          `/api/employeemanagement/addresses?parentCode=${parentCode}`
        );
        setAddressOptions((prev) => ({ ...prev, [level]: response.data }));
      } catch (error) {
        console.error(`Error fetching ${level}:`, error);
      } finally {
        setLoadingState((prev) => ({ ...prev, [level]: false }));
      }
    },
    []
  );

  useEffect(() => {
    fetchAddressOptions(0, "region");
  }, [fetchAddressOptions]);

  useEffect(() => {
    if (selectedRegion) {
      fetchAddressOptions(parseInt(selectedRegion), "province");
      setValue("addr_province", ""); // Clear lower-level fields on region change
      setValue("addr_municipal", "");
      setValue("addr_baranggay", "");
    }
  }, [selectedRegion, setValue, fetchAddressOptions]);

  useEffect(() => {
    if (selectedProvince) {
      fetchAddressOptions(parseInt(selectedProvince), "municipal");
      setValue("addr_municipal", ""); // Clear lower-level fields on province change
      setValue("addr_baranggay", "");
    }
  }, [selectedProvince, setValue, fetchAddressOptions]);

  useEffect(() => {
    if (selectedMunicipal) {
      fetchAddressOptions(parseInt(selectedMunicipal), "baranggay");
      setValue("addr_baranggay", ""); // Clear baranggay on municipal change
    }
  }, [selectedMunicipal, setValue, fetchAddressOptions]);

  // Populate fields with initial data from the server
  useEffect(() => {
    const pictureValue = getValues("picture");
    const region = getValues("addr_region");
    const province = getValues("addr_province");
    const municipal = getValues("addr_municipal");
    const gender = getValues("gender");
    const baranggay = getValues("addr_baranggay");

    if (pictureValue) {
      setImagePreview(pictureValue);
    }

    if (region) {
      fetchAddressOptions(parseInt(region), "province");
    }
    if (province) {
      fetchAddressOptions(parseInt(province), "municipal");
    }
    if (municipal) {
      fetchAddressOptions(parseInt(municipal), "baranggay");
    }

    if (gender) {
      setValue("gender", gender); // Set gender value
    }
  }, [getValues, setValue]);

  // Image handling logic...
  // Rest of the component logic...

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
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    field.onChange(value);
                    setValue("gender", value); // Explicitly set the value
                  }}
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
      <Text className="text-medium font-semibold">Address Information</Text>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="addr_region"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <FormControl>
                <Select
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    field.onChange(value);
                  }}
                  placeholder={
                    loadingState.region ? "Loading..." : "Select region"
                  }
                  variant="bordered"
                >
                  {addressOptions.region.map((region) => (
                    <SelectItem
                      key={region.address_code.toString()}
                      value={region.address_code.toString()}
                    >
                      {region.address_name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <Controller
          name="addr_province"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <FormControl>
                <Select
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    field.onChange(value);
                  }}
                  placeholder={
                    loadingState.province ? "Loading..." : "Select province"
                  }
                  variant="bordered"
                  isDisabled={!selectedRegion || loadingState.province}
                >
                  {addressOptions.province.map((province) => (
                    <SelectItem
                      key={province.address_code.toString()}
                      value={province.address_code.toString()}
                    >
                      {province.address_name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <Controller
          name="addr_municipal"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Municipal</FormLabel>
              <FormControl>
                <Select
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    field.onChange(value);
                  }}
                  placeholder={
                    loadingState.municipal ? "Loading..." : "Select municipal"
                  }
                  variant="bordered"
                  isDisabled={!selectedProvince || loadingState.municipal}
                >
                  {addressOptions.municipal.map((municipal) => (
                    <SelectItem
                      key={municipal.address_code.toString()}
                      value={municipal.address_code.toString()}
                    >
                      {municipal.address_name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <Controller
          name="addr_baranggay"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Baranggay</FormLabel>
              <FormControl>
                <Select
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    field.onChange(value);
                  }}
                  placeholder={
                    loadingState.baranggay ? "Loading..." : "Select baranggay"
                  }
                  variant="bordered"
                  isDisabled={!selectedMunicipal || loadingState.baranggay}
                >
                  {addressOptions.baranggay.map((baranggay) => (
                    <SelectItem
                      key={baranggay.address_code.toString()}
                      value={baranggay.address_code.toString()}
                    >
                      {baranggay.address_name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default EditPersonalInformationForm;
