"use client";
import React, { useState, useEffect } from "react";
import { Select, SelectItem } from "@nextui-org/react";
import { AddressType } from "@/types/References/Informations";
import axios from "axios";

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
  const [municipalities, setMunicipalities] = useState<AddressType[]>([]);
  const [barangays, setBarangays] = useState<AddressType[]>([]);

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const response = await axios.get("/api/admin/address");
        const data: AddressType[] = response.data;
        setAddressData(data);
      } catch (error) {
        console.error("Error fetching address data:", error);
      }
    };
    fetchAddressData();
  }, []);

  useEffect(() => {
    if (addressData) {
      const regionData = addressData.filter((item) => item.parent_code === 0);
      setRegions(regionData);

      if (initialRegion && !selectedRegion){
        setSelectedRegion(String(initialRegion))
        setProvinces(addressData.filter((item) => item.parent_code === initialRegion))
      };
      if (initialProvince && !selectedProvince){
        setSelectedProvince(String(initialProvince))
        setMunicipalities(addressData.filter((item) => item.parent_code === initialProvince))
      };
      if (initialMunicipal) setSelectedMunicipality(String(initialMunicipal));
      if (initialBaranggay) setSelectedBarangay(String(initialBaranggay));
    }
  }, [addressData, initialRegion, initialProvince, initialMunicipal, initialBaranggay]);

  useEffect(() => {
    if (selectedRegion) {
      const provinceData = addressData.filter(
        (item) => item.parent_code === Number(selectedRegion)
      );
      setProvinces(provinceData);
      setSelectedProvince(null);
      setMunicipalities([]);
      setBarangays([]);
      if (onRegionChange) onRegionChange(Number(selectedRegion));
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedProvince) {
      const cityData = addressData.filter(
        (item) => item.parent_code === Number(selectedProvince)
      );
      setMunicipalities(cityData);
      setSelectedMunicipality(null);
      setBarangays([]);
      if (onProvinceChange) onProvinceChange(Number(selectedProvince));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedMunicipality) {
      const barangayData = addressData.filter(
        (item) => item.parent_code === Number(selectedMunicipality)
      );
      setBarangays(barangayData);
      if (onMunicipalChange) onMunicipalChange(Number(selectedMunicipality));
    }
  }, [selectedMunicipality]);

  useEffect(() => {
    if (selectedBarangay && onBaranggayChange) {
      onBaranggayChange(Number(selectedBarangay));
    }
  }, [selectedBarangay]);

  return (
    <div className={className}>
      <Select
        label="Region"
        placeholder="Select a region"
        isLoading={!(regions.length > 0)}
        onChange={(e) => setSelectedRegion(e.target.value)}
        selectedKeys={selectedRegion || undefined}
      >
        {regions.map((region) => (
          <SelectItem key={region.address_code} value={String(region.address_code)}>
            {region.address_name}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Province"
        placeholder="Select a province"
        onChange={(e) => setSelectedProvince(e.target.value)}
        selectedKeys={selectedProvince || undefined}
        isLoading={!(provinces.length > 0)}
      >
        {provinces.map((province) => (
          <SelectItem key={province.address_code} value={String(province.address_code)}>
            {province.address_name}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Municipality"
        placeholder="Select a municipality"
        onChange={(e) => setSelectedMunicipality(e.target.value)}
        selectedKeys={selectedMunicipality || undefined}
        isLoading={!(municipalities.length > 0)}
      >
        {municipalities.map((municipality) => (
          <SelectItem key={municipality.address_code} value={String(municipality.address_code)}>
            {municipality.address_name}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Barangay"
        placeholder="Select a barangay"
        onChange={(e) => setSelectedBarangay(e.target.value)}
        selectedKeys={selectedBarangay || undefined}
        isLoading={!(barangays.length > 0)}
      >
        {barangays.map((barangay) => (
          <SelectItem key={barangay.address_code} value={String(barangay.address_code)}>
            {barangay.address_name}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default AddressSelection;
