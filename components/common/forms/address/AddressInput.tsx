import React, {useEffect, useState} from "react";
import {Controller, useFormContext} from "react-hook-form";
import addressData from "./address.json";
import {Selection} from "./../FormFields";
import {SelectionItems} from "@/components/common/forms/types/SelectionProp";
import {Autocomplete, AutocompleteItem} from "@nextui-org/react";
import {FormLabel} from "@/components/ui/form";
import {upperCase} from "lodash";

const AddressInput: React.FC = () => {
    const {control, setValue, getValues, watch} = useFormContext();
    const [regions, setRegions] = useState<SelectionItems[]>([]);
    const [provinces, setProvinces] = useState<SelectionItems[]>([]);
    const [cities, setCities] = useState<SelectionItems[]>([]);
    const [barangays, setBarangays] = useState<SelectionItems[]>([]);

    const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
    const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined);
    const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
    const [selectedBarangay, setSelectedBarangay] = useState<string | undefined>(undefined);
    
    // const initialRegion = getValues('region') ? String(getValues('region')) : undefined;
    // const initialProvince = getValues('province') ? String(getValues('province')) : undefined;
    // const initialCity = getValues('city') ? String(getValues('city')) : undefined;
    // const initialBarangay = getValues('barangay') ? String(getValues('barangay')) : undefined;

    const initialRegion = getValues("addr_region") ? String(getValues("addr_region")) : "";
    const initialProvince = getValues("addr_province") ? String(getValues("addr_province")) : "";
    const initialCity = getValues("addr_municipal") ? String(getValues("addr_municipal")) : "";
    const initialBarangay = getValues("addr_baranggay") ? String(getValues("addr_baranggay")) : "";

    // Load initial values from form
    useEffect(() => {
        // Load regions
        const filteredRegions = addressData.filter((addr) => addr.parent_code === 0);
        const regionItems = filteredRegions.map((region) => ({
            key: String(region.address_code), 
            label: region.address_name,
        }));
        setRegions(regionItems);

        // Set initial region and load its provinces
        if (initialRegion) {
            setSelectedRegion(initialRegion);
            const filteredProvinces = addressData.filter((addr) => String(addr.parent_code) === initialRegion);
            const provinceItems = filteredProvinces.map((province) => ({
                key: String(province.address_code), 
                label: province.address_name,
            }));
            setProvinces(provinceItems);
            
            // Set initial province and load its cities
            if (initialProvince) {
                setSelectedProvince(initialProvince);
                const filteredCities = addressData.filter((addr) => String(addr.parent_code) === initialProvince);
                const cityItems = filteredCities.map((city) => ({
                    key: String(city.address_code), 
                    label: city.address_name,
                }));
                setCities(cityItems);

                // Set initial city and load its barangays
                if (initialCity) {
                    setSelectedCity(initialCity);
                    const filteredBarangays = addressData.filter((addr) => String(addr.parent_code) === initialCity);
                    const barangayItems = filteredBarangays.map((barangay) => ({
                        key: String(barangay.address_code), 
                        label: barangay.address_name,
                    }));
                    setBarangays(barangayItems);

                    if (initialBarangay) {
                        setSelectedBarangay(initialBarangay);
                    }
                }
            }
        }
    }, [initialRegion, initialProvince, initialCity, initialBarangay]);

    // Update provinces when selectedRegion changes
    useEffect(() => {
        if (selectedRegion) {
            const filteredProvinces = addressData.filter((addr) => String(addr.parent_code) === selectedRegion);
            const provinceItems = filteredProvinces.map((province) => ({
                key: String(province.address_code), 
                label: province.address_name,
            }));
            setProvinces(provinceItems);
            
            // Only reset if there's no initial province
            if (!initialProvince) {
                setSelectedProvince(undefined);
                setCities([]);
                setBarangays([]);
                setSelectedCity(undefined);
                setSelectedBarangay(undefined);
            }
        }
    }, [selectedRegion, initialProvince]);

    // Update cities when selectedProvince changes
    useEffect(() => {
        if (selectedProvince) {
            const filteredCities = addressData.filter((addr) => String(addr.parent_code) === selectedProvince);
            const cityItems = filteredCities.map((city) => ({
                key: String(city.address_code), 
                label: city.address_name,
            }));
            setCities(cityItems);
            
            // Only reset if there's no initial city
            if (!initialCity) {
                setSelectedCity(undefined);
                setBarangays([]);
                setSelectedBarangay(undefined);
            }
        }
    }, [selectedProvince, initialCity]);

    // Update barangays when selectedCity changes
    useEffect(() => {
        if (selectedCity) {
            const filteredBarangays = addressData.filter((addr) => String(addr.parent_code) === selectedCity);
            const barangayItems = filteredBarangays.map((barangay) => ({
                key: String(barangay.address_code), 
                label: barangay.address_name,
            }));
            setBarangays(barangayItems);
            
            // Only reset if there's no initial barangay
            if (!initialBarangay) {
                setSelectedBarangay(undefined);
            }
        }
    }, [selectedCity, initialBarangay]);

    return (<>
        {/* Region Selection */}
        <Controller
            control={control}
            name="addr_region"
            defaultValue={initialRegion}
            render={({field}) => (<Autocomplete
                {...field}
                name="addr_region"
                disableSelectorIconRotation
                defaultItems={regions}
                defaultSelectedKey={selectedRegion}
                selectedKey={selectedRegion}
                label={<FormLabel>
                    Region
                    <span className="text-destructive text-medium"> *</span>
                </FormLabel>}
                labelPlacement="outside"
                placeholder="Select Region"
                aria-label="Region"
                color="primary"
                variant="bordered"
                radius="sm"
                onSelectionChange={(e) => {
                    const regionKey = String(e);
                    setSelectedRegion(regionKey);
                    setValue("addr_region", regionKey);
                    field.onChange(regionKey);
                    setValue("addr_province", "", {shouldValidate: true});
                    setValue("addr_municipal", "", {shouldValidate: true});
                    setValue("addr_baranggay", "", {shouldValidate: true});
                }}
            >
                {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
            </Autocomplete>)}
        />

        {/* Province Selection */}
        <Controller
            control={control}
            name="addr_province"
            defaultValue={selectedProvince}
            render={({field}) => (
                <Autocomplete
                    {...field}
                    disableSelectorIconRotation
                    defaultItems={provinces}
                    defaultSelectedKey={selectedProvince}
                    selectedKey={selectedProvince}
                    label={<FormLabel>
                        Province
                        <span className="text-destructive text-medium"> *</span>
                    </FormLabel>}
                    labelPlacement="outside"
                    placeholder="Select Province"
                    isDisabled={provinces.length === 0}
                    color="primary"
                    variant="bordered"
                    radius="sm"
                    onSelectionChange={(e) => {
                        const provinceKey = String(e);
                        setSelectedProvince(provinceKey);
                        setValue("addr_province", provinceKey);
                        field.onChange(provinceKey);
                        setValue("addr_municipal", "", {shouldValidate: true});
                        setValue("addr_baranggay", "", {shouldValidate: true});
                    }}
                >
                    {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
                </Autocomplete>

                // <Selection
                //     placeholder="Select City/Municipality"
                //     name="addr_municipal"
                //     label="City/Municipality"
                //     items={cities}
                //     isDisabled={cities.length === 0}
                //     isRequired={true}
                //     selectedKeys={selectedCity ? [selectedCity] : undefined}
                //     onSelectionChange={(e) => {
                //         const cityKey = e.currentKey as string;
                //         setSelectedCity(cityKey);
                //         setValue("addr_municipal", cityKey);
                //         field.onChange(cityKey);
                //         setValue('addr_baranggay', '', {shouldValidate: true});
                //     }}
                // />
            )}
        />

        {/* City/Municipality Selection */}
        <Controller
            control={control}
            name="addr_municipal"
            defaultValue={selectedCity}
            render={({field}) => (<Autocomplete
                    {...field}
                    disableSelectorIconRotation
                    defaultItems={cities}
                    defaultSelectedKey={selectedCity}
                    selectedKey={selectedCity}
                    label={<FormLabel>
                        City/Municipality
                        <span className="text-destructive text-medium"> *</span>
                    </FormLabel>}
                    labelPlacement="outside"
                    placeholder="Select City/Municipality"
                    isDisabled={cities.length === 0}
                    color="primary"
                    variant="bordered"
                    radius="sm"
                    onSelectionChange={(e) => {
                        const cityKey = String(e);
                        setSelectedCity(cityKey);
                        setValue("addr_municipal", cityKey);
                        field.onChange(cityKey);
                        setValue('addr_baranggay', '', {shouldValidate: true});
                    }}
                >
                    {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
                </Autocomplete>
            )}
        />

        {/* Barangay Selection */}
        <Controller
            control={control}
            name="addr_baranggay"
            defaultValue={selectedBarangay}
            render={({field}) => (
                <Autocomplete
                    {...field}
                    name="addr_baranggay"
                    disableSelectorIconRotation
                    defaultItems={barangays.map((item) => ({
                        key: item.key,
                        label: upperCase(item.label)
                    }))}
                    defaultSelectedKey={selectedBarangay}
                    selectedKey={selectedBarangay}
                    label={<FormLabel>
                        Barangay
                        <span className="text-destructive text-medium"> *</span>
                    </FormLabel>}
                    labelPlacement="outside"
                    placeholder="Select Barangay"
                    isDisabled={barangays.length === 0}
                    color="primary"
                    variant="bordered"
                    radius="sm"
                    onSelectionChange={(e) => {
                        const barangayKey = String(e);
                        setSelectedBarangay(barangayKey);
                        setValue("addr_baranggay", barangayKey);
                        field.onChange(barangayKey);
                    }}
                >
                    {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
                </Autocomplete>
            )}
        />
    </>);
};

export default AddressInput;