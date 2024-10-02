"use client";
import { z } from "zod";
import { useParams } from "next/navigation";
import { AffectedJson, PayheadAffected } from "@/types/payroll/payrollType";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/dist/client/components/navigation";
import { PayheadForm } from "@/components/admin/payroll/PayheadUI";
import fetcher from "@/services/fetcher";
import useSWR from "swr";import React, { useState } from "react";
import axios from "axios";


function Page() {
  const { id } = useParams();
  const { data, isLoading } = useSWR<PayheadAffected>(
    `/api/admin/payroll/payhead/read?id=${id}`,
    fetcher
  );
  const router = useRouter();

  const onSubmit = async (values: z.infer<any>, employees: number[], affectedJson: AffectedJson) => {
    try {
      await axios.post(
        `/api/admin/payroll/payhead/update?id=${id}`,
        {
          data: values,
          affected: employees,
          affectedJson: affectedJson,
        }
      );
      toast({
        title: "Updated",
        description: "Deduction updated successfully!",
        variant: "success",
      });
      setTimeout(() => {
        router.push(`/payroll/deductions`);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error updating: " + error,
        variant: "danger",
      });
    }
  };

  return (
    <PayheadForm
        label="Update Deduction"
        type="deduction"
        onSubmit={onSubmit}
        allData={{data:data!, isLoading:isLoading}}
      />
  );
}

export default Page;
