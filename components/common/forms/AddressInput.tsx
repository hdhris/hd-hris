"use client";
import React, { useState, useEffect } from "react";
import { Select, SelectItem } from "@nextui-org/react";
import { AddressType } from "@/types/References/Informations";
import axios from "axios";

// // Sample address data
// const addressData = [
//   { address_code: '1', address_name: 'Region A', parent_code: '0' },
//   { address_code: '2', address_name: 'Region B', parent_code: '0' },
//   { address_code: '3', address_name: 'Province A1', parent_code: '1' },
//   { address_code: '4', address_name: 'Province B1', parent_code: '2' },
//   { address_code: '5', address_name: 'City A1', parent_code: '3' },
//   { address_code: '6', address_name: 'City B1', parent_code: '4' },
//   { address_code: '7', address_name: 'Barangay A1', parent_code: '5' },
//   { address_code: '8', address_name: 'Barangay B1', parent_code: '6' },
// ];

const AddressSelection: React.FC = () => {
  const [addressData, setAddressData] = useState<AddressType[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

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
      const fetchRegions = () => {
        const regionData = addressData.filter((item) => item.parent_code === 0);
        setRegions(regionData);
      };
      fetchRegions();
    }
  }, [addressData]);

  useEffect(() => {
    if (!selectedRegion) return;

    // Update provinces when region changes
    const provinceData = addressData.filter(
        (item) => item.parent_code === Number(selectedRegion)
    );
    setProvinces(provinceData);
    setSelectedProvince(null); // Reset province when region changes
    setCities([]);             // Reset cities
    setBarangays([]);           // Reset barangays

    if (selectedProvince) {
      // Update cities when province changes
      const cityData = addressData.filter(
          (item) => item.parent_code === Number(selectedProvince)
      );
      setCities(cityData);
      setSelectedCity(null);    // Reset city when province changes
      setBarangays([]);         // Reset barangays
    }

    if (selectedCity) {
      // Update barangays when city changes
      const barangayData = addressData.filter(
          (item) => item.parent_code === Number(selectedCity)
      );
      setBarangays(barangayData);
    }
  }, [addressData, selectedRegion, selectedProvince, selectedCity]);


  return (
    <div>
      <Select
        label="Region"
        placeholder="Select a region"
        isLoading={!(addressData.length>0)}
        onChange={(e) => setSelectedRegion(e.target.value)}
        value={selectedRegion || undefined}
      >
        {regions.map((region) => (
          <SelectItem key={region.address_code} value={region.address_code}>
            {region.address_name}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Province"
        placeholder="Select a province"
        onChange={(e) => setSelectedProvince(e.target.value)}
        value={selectedProvince || undefined}
        disabled={!selectedRegion}
      >
        {provinces.map((province) => (
          <SelectItem key={province.address_code} value={province.address_code}>
            {province.address_name}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Municipality"
        placeholder="Select a municipality"
        onChange={(e) => setSelectedCity(e.target.value)}
        value={selectedCity || undefined}
        disabled={!selectedProvince}
      >
        {cities.map((city) => (
          <SelectItem key={city.address_code} value={city.address_code}>
            {city.address_name}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Barangay"
        placeholder="Select a barangay"
        onChange={(e) => console.log("Selected barangay:", e.target.value)}
        disabled={!selectedCity}
      >
        {barangays.map((barangay) => (
          <SelectItem key={barangay.address_code} value={barangay.address_code}>
            {barangay.address_name}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default AddressSelection;
