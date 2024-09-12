"use client";
import AddressInput from "@/components/common/forms/AddressInput";
import React from "react";

export default function overtime() {
  return (
    <>
      <div>Overtime</div>
      <AddressInput
        className=" flex flex-row"
        initialRegion={12}
        initialProvince={1263}
        onRegionChange={(r) => alert("You picked REGION " + r)}
      />
    </>
  );
}
