"use client";
import { z } from "zod";
import { useParams } from "next/navigation";
import { PayheadAffected } from "@/types/payroll/payrollType";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/dist/client/components/navigation";
import { formSchema, PayheadForm } from "@/components/admin/payroll/PayheadUI";
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

  const onSubmit = async (values: z.infer<typeof formSchema>, keys: number[]) => {
    console.log([values, keys]);
    try {
      await axios.post(
        `/api/admin/payroll/payhead/update?id=${id}`,
        {
          data: values,
          affected: values.is_mandatory? []:keys,
        }
      );
      toast({
        title: "Updated",
        description: "Earning updated successfully!",
        variant: "success",
      });
      setTimeout(() => {
        router.push(`/payroll/earnings`);
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
        label="Update Earning"
        type="earning"
        onSubmit={onSubmit}
        allData={{data:data!, isLoading:isLoading}}
      />
  );
}

export default Page;
