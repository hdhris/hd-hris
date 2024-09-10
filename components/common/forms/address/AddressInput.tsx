import React, { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import addressData from './address.json';
import { Selection } from './../FormFields';
import { SelectionItems } from '@/components/common/forms/types/SelectionProp';

const AddressInput = () => {
    const { control, setValue, getValues } = useFormContext();
    const [regions, setRegions] = useState<SelectionItems[]>([]);
    const [provinces, setProvinces] = useState<SelectionItems[]>([]);
    const [cities, setCities] = useState<SelectionItems[]>([]);
    const [barangays, setBarangays] = useState<SelectionItems[]>([]);

    const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
    const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined);
    const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
    const [selectedBarangay, setSelectedBarangay] = useState<string | undefined>(undefined);

    // Load initial values from form
    useEffect(() => {
        // Get initial values from react-hook-form
        const initialRegion = getValues("region");
        const initialProvince = getValues("province");
        const initialCity = getValues("city");
        const initialBarangay = getValues("barangay");


        setSelectedRegion(initialRegion ? String(initialRegion) : undefined);
        setSelectedProvince(initialProvince ? String(initialProvince) : undefined);
        setSelectedCity(initialCity ? String(initialCity) : undefined);
        setSelectedBarangay(initialBarangay ? String(initialBarangay) : undefined);

        // Load regions
        const filteredRegions = addressData.filter(addr => addr.parent_code === 0);
        const regionItems = filteredRegions.map(region => ({
            key: region.address_code,
            label: region.address_name,
        }));
        setRegions(regionItems);

        // Load provinces if initialRegion is provided
        if (initialRegion) {
            const filteredProvinces = addressData.filter(addr => addr.parent_code === Number(initialRegion));
            const provinceItems = filteredProvinces.map(province => ({
                key: province.address_code,
                label: province.address_name,
            }));
            setProvinces(provinceItems);
        }

        // Load cities if initialProvince is provided
        if (initialProvince) {
            const filteredCities = addressData.filter(addr => addr.parent_code === Number(initialProvince));
            const cityItems = filteredCities.map(city => ({
                key: city.address_code,
                label: city.address_name,
            }));
            setCities(cityItems);
        }

        // Load barangays if initialCity is provided
        if (initialCity) {
            const filteredBarangays = addressData.filter(addr => addr.parent_code === Number(initialCity));
            const barangayItems = filteredBarangays.map(barangay => ({
                key: barangay.address_code,
                label: barangay.address_name,
            }));
            setBarangays(barangayItems);
        }
    }, [getValues]);

    // Update provinces when selectedRegion changes
    useEffect(() => {
        if (selectedRegion) {
            const filteredProvinces = addressData.filter(addr => addr.parent_code === Number(selectedRegion));
            const provinceItems = filteredProvinces.map(province => ({
                key: province.address_code,
                label: province.address_name,
            }));
            setProvinces(provinceItems);
            setCities([]); // Reset cities
            setBarangays([]); // Reset barangays
            setSelectedProvince(undefined);
            setSelectedCity(undefined);
            setSelectedBarangay(undefined);
        }
    }, [selectedRegion]);

    // Update cities when selectedProvince changes
    useEffect(() => {
        if (selectedProvince) {
            const filteredCities = addressData.filter(addr => addr.parent_code === Number(selectedProvince));
            const cityItems = filteredCities.map(city => ({
                key: city.address_code,
                label: city.address_name,
            }));
            setCities(cityItems);
            setBarangays([]); // Reset barangays
            setSelectedCity(undefined);
            setSelectedBarangay(undefined);
        }
    }, [selectedProvince]);

    // Update barangays when selectedCity changes
    useEffect(() => {
        if (selectedCity) {
            const filteredBarangays = addressData.filter(addr => addr.parent_code === Number(selectedCity));
            const barangayItems = filteredBarangays.map(barangay => ({
                key: barangay.address_code,
                label: barangay.address_name,
            }));
            setBarangays(barangayItems);
            setSelectedBarangay(undefined);
        }
    }, [selectedCity]);

    return (
        <>
            {/* Region Selection */}
            <Controller
                control={control}
                name="region"
                defaultValue={selectedRegion}
                render={({ field }) => (
                    <Selection
                        placeholder="Select Region"
                        name="region"
                        label="Region"
                        items={regions}
                        isRequired={true}
                        selectedKeys={selectedRegion ? [selectedRegion] : undefined}
                        onSelectionChange={(e) => {
                            const regionKey = e.currentKey as string;
                            setSelectedRegion(regionKey);
                            setValue("region", regionKey); // Update the form value
                            field.onChange(regionKey); // Update react-hook-form's state
                        }}
                    />
                )}
            />

            {/* Province Selection */}
            <Controller
                control={control}
                name="province"
                defaultValue={selectedProvince}
                render={({ field }) => (
                    <Selection
                        placeholder="Select Province"
                        name="province"
                        label="Province"
                        items={provinces}
                        isDisabled={provinces.length === 0}
                        isRequired={true}
                        selectedKeys={selectedProvince ? [selectedProvince] : undefined}
                        onSelectionChange={(e) => {
                            const provinceKey = e.currentKey as string;
                            setSelectedProvince(provinceKey);
                            setValue("province", provinceKey);
                            field.onChange(provinceKey);
                        }}
                    />
                )}
            />

            {/* City/Municipality Selection */}
            <Controller
                control={control}
                name="city"
                defaultValue={selectedCity}
                render={({ field }) => (
                    <Selection
                        placeholder="Select City/Municipality"
                        name="city"
                        label="City/Municipality"
                        items={cities}
                        isDisabled={cities.length === 0}
                        isRequired={true}
                        selectedKeys={selectedCity ? [selectedCity] : undefined}
                        onSelectionChange={(e) => {
                            const cityKey = e.currentKey as string;
                            setSelectedCity(cityKey);
                            setValue("city", cityKey);
                            field.onChange(cityKey);
                        }}
                    />
                )}
            />

            {/* Barangay Selection */}
            <Controller
                control={control}
                name="barangay"
                defaultValue={selectedBarangay}
                render={({ field }) => (
                    <Selection
                        placeholder="Select Barangay"
                        name="barangay"
                        label="Barangay"
                        items={barangays}
                        isDisabled={barangays.length === 0}
                        isRequired={true}
                        selectedKeys={selectedBarangay ? [selectedBarangay] : undefined}
                        onSelectionChange={(e) => {
                            const barangayKey = e.currentKey as string;
                            setSelectedBarangay(barangayKey);
                            setValue("barangay", barangayKey);
                            field.onChange(barangayKey);
                        }}
                    />
                )}
            />
        </>
    );
};

export default AddressInput;
