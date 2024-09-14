import React, { useState, useRef, useEffect } from "react";
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
import { useEdgeStore } from "@/lib/edgestore/edgestore";

interface AddressOption {
  address_code: number;
  address_name: string;
}

const genderOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
];

const PersonalInformationForm: React.FC = () => {
  const { control, setValue } = useFormContext();
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { edgestore } = useEdgeStore();

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

  const selectedRegion = useWatch({ name: "addr_region" });
  const selectedProvince = useWatch({ name: "addr_province" });
  const selectedMunicipal = useWatch({ name: "addr_municipal" });

  useEffect(() => {
    if (selectedRegion) {
      fetchAddressOptions(parseInt(selectedRegion as string), "province");
      setValue("addr_province", "");
      setValue("addr_municipal", "");
      setValue("addr_baranggay", "");
    }
  }, [selectedRegion, setValue]);

  useEffect(() => {
    if (selectedProvince) {
      fetchAddressOptions(parseInt(selectedProvince as string), "municipal");
      setValue("addr_municipal", "");
      setValue("addr_baranggay", "");
    }
  }, [selectedProvince, setValue]);

  useEffect(() => {
    if (selectedMunicipal) {
      fetchAddressOptions(parseInt(selectedMunicipal as string), "baranggay");
      setValue("addr_baranggay", "");
    }
  }, [selectedMunicipal, setValue]);

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
        });

        setImagePreview(res.url);
        setValue("picture", res.url);
      } catch (error) {
        setFileError("Failed to upload image");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-6">
        <div>
          <Avatar
            src={imagePreview || undefined} // Ensure Avatar gets only one child
            isBordered
            color="primary"
            className="w-24 h-24"
            icon={imagePreview ? undefined : <UserRound className="w-12 h-12" />}
          />
          <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
            Upload Picture
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
          {fileError && <Text color="danger">{fileError}</Text>}
        </div>

        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
          <FormControl>
            <FormLabel>First Name</FormLabel>
            <FormItem>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="First Name" />
                )}
              />
            </FormItem>
          </FormControl>

          <FormControl>
            <FormLabel>Last Name</FormLabel>
            <FormItem>
              <Controller
                name="last_name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Last Name" />
                )}
              />
            </FormItem>
          </FormControl>

          <FormControl>
            <FormLabel>Middle Name</FormLabel>
            <FormItem>
              <Controller
                name="middle_name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Middle Name" />
                )}
              />
            </FormItem>
          </FormControl>

          <FormControl>
            <FormLabel>Gender</FormLabel>
            <FormItem>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Gender"
                    onSelectionChange={(value) => field.onChange(value)}
                  >
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </FormItem>
          </FormControl>
        </div>
      </div>

      <Divider className="my-6" />

      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <FormControl>
          <FormLabel>Date of Birth</FormLabel>
          <FormItem>
            <Controller
              name="birthdate"
              control={control}
              render={({ field }) => <DatePicker {...field} />}
            />
          </FormItem>
        </FormControl>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <FormItem>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} type="email" placeholder="Email" />
              )}
            />
          </FormItem>
        </FormControl>

        <FormControl>
          <FormLabel>Contact Number</FormLabel>
          <FormItem>
            <Controller
              name="contact_number"
              control={control}
              render={({ field }) => (
                <Input {...field} type="tel" placeholder="Contact Number" />
              )}
            />
          </FormItem>
        </FormControl>

        <FormControl>
          <FormLabel>Street Address</FormLabel>
          <FormItem>
            <Controller
              name="addr_street"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Street Address" />
              )}
            />
          </FormItem>
        </FormControl>

        <FormControl>
          <FormLabel>Region</FormLabel>
          <FormItem>
            <Controller
              name="addr_region"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select Region"
                  onSelectionChange={(value) => field.onChange(value)}
                >
                  {addressOptions.region.map((option) => (
                    <SelectItem
                      key={option.address_code}
                      value={option.address_code.toString()}
                    >
                      {option.address_name}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </FormItem>
        </FormControl>

        <FormControl>
          <FormLabel>Province</FormLabel>
          <FormItem>
            <Controller
              name="addr_province"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select Province"
                  onSelectionChange={(value) => field.onChange(value)}
                >
                  {addressOptions.province.map((option) => (
                    <SelectItem
                      key={option.address_code}
                      value={option.address_code.toString()}
                    >
                      {option.address_name}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </FormItem>
        </FormControl>

        <FormControl>
          <FormLabel>Municipal</FormLabel>
          <FormItem>
            <Controller
              name="addr_municipal"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select Municipal"
                  onSelectionChange={(value) => field.onChange(value)}
                >
                  {addressOptions.municipal.map((option) => (
                    <SelectItem
                      key={option.address_code}
                      value={option.address_code.toString()}
                    >
                      {option.address_name}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </FormItem>
        </FormControl>

        <FormControl>
          <FormLabel>Baranggay</FormLabel>
          <FormItem>
            <Controller
              name="addr_baranggay"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select Baranggay"
                  onSelectionChange={(value) => field.onChange(value)}
                >
                  {addressOptions.baranggay.map((option) => (
                    <SelectItem
                      key={option.address_code}
                      value={option.address_code.toString()}
                    >
                      {option.address_name}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </FormItem>
        </FormControl>
      </div>
    </div>
  );
};

export default PersonalInformationForm;
