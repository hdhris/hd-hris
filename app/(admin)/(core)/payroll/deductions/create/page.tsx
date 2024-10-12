"use client";
import { z } from "zod";
import { useState } from "react";
import { Selection } from "@nextui-org/react";
import { useNewPayhead } from "@/services/queries";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/dist/client/components/navigation";
import { PayheadForm } from "@/components/admin/payroll/PayheadUI";
import axios from "axios";
import { AffectedJson } from "@/types/payroll/payheadType";

function Page() {
  const { data, isLoading } = useNewPayhead();
  const router = useRouter();
  const onSubmit = async (values: z.infer<any>, employees: number[], affectedJson: AffectedJson) => {
    try {
      await axios.post("/api/admin/payroll/payhead/create", {
        data: values,
        affected: employees,
        affectedJson: affectedJson,
        type: "deduction",
      });
      toast({
        title: "Created",
        description: "Deduction created successfully!",
        variant: "success",
      });
      setTimeout(() => {
        router.push(`/payroll/deductions`);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error creating: " + error,
        variant: "danger",
      });
    }
  };

  return (
    <PayheadForm
        label="Create Deduction"
        type="deduction"
        onSubmit={onSubmit}
        allData={{data:data!, isLoading:isLoading}}
      />
  );
}

export default Page;
