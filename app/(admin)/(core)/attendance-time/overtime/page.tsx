"use client";
import AddressInput from "@/components/common/forms/address/AddressInput";
import React from "react";

export default function overtime() {
  return (
    <>
      <div>Overtime</div>
      <AddressInput
        className=" flex flex-row"
        initialRegion={1}
        onRegionChange={(r) => alert("You picked REGION " + r)}
      />
    </>
  );
}
