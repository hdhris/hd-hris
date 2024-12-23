// Keep this in your original location where Add Employee component was
"use client";
import React from "react";
import Add from "@/components/common/button/Add";
import { useRouter } from "next/navigation";

interface AddEmployeeProps {
  onEmployeeAdded: () => void;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({ onEmployeeAdded }) => {
  const router = useRouter();

  return (
    <Add 
      variant="solid" 
      name="Add Employee" 
      onPress={() => router.push("/employeemanagement/employees/add-employee")}
    />
  );
};

export default AddEmployee;