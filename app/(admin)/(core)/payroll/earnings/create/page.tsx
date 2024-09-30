"use client";
import { z } from "zod";
import { useState } from "react";
import { useNewPayhead } from "@/services/queries";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/dist/client/components/navigation";
import { formSchema, PayheadForm } from "@/components/admin/payroll/PayheadUI";
import axios from "axios";

function Page() {
  const { data, isLoading } = useNewPayhead();
  const router = useRouter();
  const onSubmit = async (values: z.infer<typeof formSchema>, keys: number[]) => {
    console.log([values, keys]);
    try {
      await axios.post("/api/admin/payroll/payhead/create", {
        data: values,
        affected: values.is_mandatory? []:keys,
        type: "earning",
      });
      toast({
        title: "Created",
        description: "Earning created successfully!",
        variant: "success",
      });
      setTimeout(() => {
        router.push(`/payroll/earnings`);
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
        label="Create Earning"
        type="earning"
        onSubmit={onSubmit}
        allData={{data:data!, isLoading:isLoading}}
      />
  );
}

export default Page;
