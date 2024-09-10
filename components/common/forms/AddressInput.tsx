"use client";
import React, {useEffect, useState} from "react";
import {Select, SelectItem} from "@nextui-org/react";
import {AddressType} from "@/types/References/Informations";
import {Selection} from './FormFields'
import useSWR from "swr";
import fetcher from "@/services/fetcher";

interface AddressInputProps {
    initialRegion?: number;
    initialProvince?: number;
    initialMunicipal?: number;
    initialBaranggay?: number;
    onRegionChange?: (region: number) => void;
    onProvinceChange?: (province: number) => void;
    onMunicipalChange?: (municipal: number) => void;
    onBaranggayChange?: (baranggay: number) => void;
    className?: string;
}

const AddressSelection: React.FC<AddressInputProps> = ({
                                                           initialRegion,
                                                           initialProvince,
                                                           initialMunicipal,
                                                           initialBaranggay,
                                                           onRegionChange,
                                                           onProvinceChange,
                                                           onMunicipalChange,
                                                           onBaranggayChange,
                                                           className,
                                                       }: AddressInputProps) => {
    const [addressData, setAddressData] = useState<AddressType[]>([]);
    const [regions, setRegions] = useState<AddressType[]>([]);
    const [provinces, setProvinces] = useState<AddressType[]>([]);
    const [municipal, setMunicipal] = useState<AddressType[]>([]);
    const [barangays, setBarangays] = useState<AddressType[]>([]);


    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [selectedMunicipal, setSelectedMunicipal] = useState<string | null>(null);
    const [selectedBaranggay, setSelectedBaranggay] = useState<string | null>(null);
    const {data, isLoading} = useSWR("/api/admin/address", fetcher)

    useEffect(() => {
        if(isLoading){
            setAddressData(data)
            console.log(data)
        }
    }, [data, isLoading]);
    // useEffect(() => {
    //     const fetchAddressData = async () => {
    //         try {
    //             const response = useSWR("/api/admin/address", fetcher); // resolve the edge runtime error.
    //             const data: AddressType[] = response.data;
    //             setAddressData(data);
    //             console.log(data)
    //         } catch (error) {
    //             console.error("Error fetching address data:", error);
    //         }
    //     };
    //     fetchAddressData();
    // }, []);

    useEffect(() => {
        if (addressData) {
            const fetchRegions = () => {
                const regionData = addressData.filter((item) => item.parent_code === 0);
                setRegions(regionData);
            };
            fetchRegions();
            if (initialRegion) setSelectedRegion(String(initialRegion))
        }
    }, [addressData, initialRegion]); // adding deps

    // useEffect(() => {
    //     if (selectedRegion) {
    //         const provinceData = addressData.filter((item) => item.parent_code === Number(selectedRegion));
    //         setProvinces(provinceData);
    //         setSelectedProvince(null);
    //         setMunicipal([]);
    //         setBarangays([]);
    //         if (initialProvince) setSelectedProvince(String(initialProvince))
    //         if (onRegionChange) onRegionChange(Number(selectedRegion));
    //     }
    // }, [selectedRegion, onRegionChange, addressData, initialProvince]); // adding deps
    //
    // useEffect(() => {
    //     if (selectedProvince) {
    //         const cityData = addressData.filter((item) => item.parent_code === Number(selectedProvince));
    //         setMunicipal(cityData);
    //         setSelectedMunicipal(null);
    //         setBarangays([]);
    //         if (initialMunicipal) setSelectedRegion(String(initialMunicipal))
    //         if (onProvinceChange) onProvinceChange(Number(selectedProvince));
    //     }
    // }, [selectedProvince, onProvinceChange, addressData, initialMunicipal]);// adding deps
    //
    // useEffect(() => {
    //     if (selectedMunicipal) {
    //         const barangayData = addressData.filter((item) => item.parent_code === Number(selectedMunicipal));
    //         setBarangays(barangayData);
    //         if (initialBaranggay) setSelectedRegion(String(initialBaranggay))
    //         if (onMunicipalChange) onMunicipalChange(Number(selectedMunicipal));
    //     }
    // }, [selectedMunicipal, onMunicipalChange, addressData, initialBaranggay]); // adding deps
    //
    // useEffect(() => {
    //     if (selectedBaranggay && onBaranggayChange) {
    //         onBaranggayChange(Number(selectedBaranggay));
    //     }
    // }, [selectedBaranggay, onBaranggayChange]);

    return (<div className={className}>
            <Selection
                items={regions.map((address) => ({key: address.address_code, label: address.address_name}))}
                defaultSelectedKeys={[String(initialRegion)]}
                name='region'
                aria-label="Region"
                label="Region"
            />

            {/*<Select*/}
            {/*  label="Region"*/}
            {/*  placeholder="Select a region"*/}
            {/*  isLoading={!(addressData.length>0)}*/}
            {/*  defaultSelectedKeys={[String(initialRegion)]}*/}
            {/*  onChange={(e) => setSelectedRegion(e.target.value)}*/}
            {/*  value={selectedRegion || undefined}*/}
            {/*>*/}
            {/*  {regions.map((region) => (*/}
            {/*    <SelectItem key={region.address_code} value={region.address_code}>*/}
            {/*      {region.address_name}*/}
            {/*    </SelectItem>*/}
            {/*  ))}*/}
            {/*</Select>*/}

            {/*<Select*/}
            {/*    label="Province"*/}
            {/*    placeholder="Select a province"*/}
            {/*    defaultSelectedKeys={[String(initialProvince)]}*/}
            {/*    onChange={(e) => setSelectedProvince(e.target.value)}*/}
            {/*    value={selectedProvince || undefined}*/}
            {/*    disabled={!selectedRegion}*/}
            {/*>*/}
            {/*    {provinces.map((province) => (<SelectItem key={province.address_code} value={province.address_code}>*/}
            {/*            {province.address_name}*/}
            {/*        </SelectItem>))}*/}
            {/*</Select>*/}

            {/*<Select*/}
            {/*    label="Municipality"*/}
            {/*    placeholder="Select a municipality"*/}
            {/*    defaultSelectedKeys={[String(initialMunicipal)]}*/}
            {/*    onChange={(e) => setSelectedMunicipal(e.target.value)}*/}
            {/*    value={selectedMunicipal || undefined}*/}
            {/*    disabled={!selectedProvince}*/}
            {/*>*/}
            {/*    {municipal.map((city) => (<SelectItem key={city.address_code} value={city.address_code}>*/}
            {/*            {city.address_name}*/}
            {/*        </SelectItem>))}*/}
            {/*</Select>*/}

            {/*<Select*/}
            {/*    label="Barangay"*/}
            {/*    placeholder="Select a barangay"*/}
            {/*    defaultSelectedKeys={[String(initialBaranggay)]}*/}
            {/*    onChange={(e) => setSelectedBaranggay(e.target.value)}*/}
            {/*    value={selectedBaranggay || undefined}*/}
            {/*    disabled={!selectedMunicipal}*/}
            {/*>*/}
            {/*    {barangays.map((barangay) => (<SelectItem key={barangay.address_code} value={barangay.address_code}>*/}
            {/*            {barangay.address_name}*/}
            {/*        </SelectItem>))}*/}
            {/*</Select>*/}
        </div>);
};

export default AddressSelection;
