import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { FormLabel } from "@/components/ui/form";
import { upperCase } from "lodash";
import addressData from "@/components/common/forms/address/address.json";
import { SelectionItems } from "@/components/common/forms/types/SelectionProp";

interface TrainingAddressInputProps {
  index: number;
}

const TrainingAddressInput: React.FC<TrainingAddressInputProps> = ({
  index,
}) => {
  const { setValue, getValues } = useFormContext();
  const [regions, setRegions] = useState<SelectionItems[]>([]);
  const [provinces, setProvinces] = useState<SelectionItems[]>([]);
  const [cities, setCities] = useState<SelectionItems[]>([]);
  const [baranggays, setbaranggays] = useState<SelectionItems[]>([]);

  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(
    undefined
  );
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(
    undefined
  );
  const [selectedCity, setSelectedCity] = useState<string | undefined>(
    undefined
  );
  const [selectedbaranggay, setSelectedbaranggay] = useState<string | undefined>(
    undefined
  );

  // Load initial values from form
  useEffect(() => {
    const initialRegion = getValues(`trainings.${index}.training_region`)
      ? String(getValues(`trainings.${index}.training_region`))
      : "";
    const initialProvince = getValues(`trainings.${index}.training_province`)
      ? String(getValues(`trainings.${index}.training_province`))
      : "";
    const initialCity = getValues(`trainings.${index}.training_municipal`)
      ? String(getValues(`trainings.${index}.training_municipal`))
      : "";
    const initialbaranggay = getValues(`trainings.${index}.training_baranggay`)
      ? String(getValues(`trainings.${index}.training_baranggay`))
      : "";

    // Load regions
    const filteredRegions = addressData.filter(
      (addr) => addr.parent_code === 0
    );
    const regionItems = filteredRegions.map((region) => ({
      key: String(region.address_code),
      label: region.address_name,
    }));
    setRegions(regionItems);

    // Set initial values
    setSelectedRegion(initialRegion);
    setSelectedProvince(initialProvince);
    setSelectedCity(initialCity);
    setSelectedbaranggay(initialbaranggay);
  }, [getValues, index]);

  useEffect(() => {
    if (selectedRegion) {
      const filteredProvinces = addressData.filter(
        (addr) => String(addr.parent_code) === selectedRegion
      );
      const provinceItems = filteredProvinces.map((province) => ({
        key: String(province.address_code),
        label: province.address_name,
      }));
      setProvinces(provinceItems);
    } else {
      setProvinces([]);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedProvince) {
      const filteredCities = addressData.filter(
        (addr) => String(addr.parent_code) === selectedProvince
      );
      const cityItems = filteredCities.map((city) => ({
        key: String(city.address_code),
        label: city.address_name,
      }));
      setCities(cityItems);
    } else {
      setCities([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedCity) {
      const filteredbaranggays = addressData.filter(
        (addr) => String(addr.parent_code) === selectedCity
      );
      const baranggayItems = filteredbaranggays.map((baranggay) => ({
        key: String(baranggay.address_code),
        label: baranggay.address_name,
      }));
      setbaranggays(baranggayItems);
    } else {
      setbaranggays([]);
    }
  }, [selectedCity]);

  return (
    <>
      {/* Region Selection */}
      <div className="pt-2 pb-2">
        <Autocomplete
          disableSelectorIconRotation
          defaultItems={regions}
          defaultSelectedKey={selectedRegion}
          selectedKey={selectedRegion}
          label={
            <FormLabel>
              Region
            </FormLabel>
          }
          labelPlacement="outside"
          placeholder="Select Region"
          aria-label="Region"
          color="primary"
          variant="bordered"
          radius="sm"
          onSelectionChange={(e) => {
            const regionKey = String(e);
            setSelectedRegion(regionKey);
            setValue(`trainings.${index}.training_region`, regionKey);
            setValue(`trainings.${index}.training_province`, "", {
              shouldValidate: true,
            });
            setValue(`trainings.${index}.training_municipal`, "", {
              shouldValidate: true,
            });
            setValue(`trainings.${index}.training_baranggay`, "", {
              shouldValidate: true,
            });
          }}
        >
          {(item) => (
            <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>
      </div>

      {/* Province Selection */}
      <div className="pt-2 pb-2">
        <Autocomplete
          disableSelectorIconRotation
          defaultItems={provinces}
          defaultSelectedKey={selectedProvince}
          selectedKey={selectedProvince}
          label={
            <FormLabel>
              Province
            </FormLabel>
          }
          labelPlacement="outside"
          placeholder="Select Province"
          isDisabled={provinces.length === 0}
          color="primary"
          variant="bordered"
          radius="sm"
          onSelectionChange={(e) => {
            const provinceKey = String(e);
            setSelectedProvince(provinceKey);
            setValue(`trainings.${index}.training_province`, provinceKey);
            setValue(`trainings.${index}.training_municipal`, "", {
              shouldValidate: true,
            });
            setValue(`trainings.${index}.training_baranggay`, "", {
              shouldValidate: true,
            });
          }}
        >
          {(item) => (
            <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>
      </div>

      {/* City/Municipality Selection */}
      <div className="pt-2 pb-2">
        <Autocomplete
          disableSelectorIconRotation
          defaultItems={cities}
          defaultSelectedKey={selectedCity}
          selectedKey={selectedCity}
          label={
            <FormLabel>
              City/Municipality
            </FormLabel>
          }
          labelPlacement="outside"
          placeholder="Select City/Municipality"
          isDisabled={cities.length === 0}
          color="primary"
          variant="bordered"
          radius="sm"
          onSelectionChange={(e) => {
            const cityKey = String(e);
            setSelectedCity(cityKey);
            setValue(`trainings.${index}.training_municipal`, cityKey);
            setValue(`trainings.${index}.training_baranggay`, "", {
              shouldValidate: true,
            });
          }}
        >
          {(item) => (
            <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>
      </div>

      {/* baranggay Selection */}
      <div className="pt-2 pb-2">
        <Autocomplete
          disableSelectorIconRotation
          defaultItems={baranggays.map((item) => ({
            key: item.key,
            label: upperCase(item.label),
          }))}
          defaultSelectedKey={selectedbaranggay}
          selectedKey={selectedbaranggay}
          label={
            <FormLabel>
              Barangay
            </FormLabel>
          }
          labelPlacement="outside"
          placeholder="Select barangay"
          isDisabled={baranggays.length === 0}
          color="primary"
          variant="bordered"
          radius="sm"
          onSelectionChange={(e) => {
            const baranggayKey = String(e);
            setSelectedbaranggay(baranggayKey);
            setValue(`trainings.${index}.training_baranggay`, baranggayKey);
          }}
        >
          {(item) => (
            <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>
      </div>
    </>
  );
};

export default TrainingAddressInput;
