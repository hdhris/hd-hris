"use client";
import { z } from "zod";
import { useState } from "react";
import { useNewPayhead } from "@/services/queries";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/dist/client/components/navigation";
import { formSchema, PayheadForm } from "@/components/admin/payroll/PayheadUI";
import axios from "axios";

function Page() {
  const [selectedKeys, setSelectedKeys] = useState<any>([]);
  const { data, isLoading } = useNewPayhead();
  const router = useRouter();
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log([values, selectedKeys.map(Number)]);
    try {
      await axios.post("/api/admin/payroll/payhead/create", {
        data: values,
        affected: values.is_mandatory? []:selectedKeys.map(Number),
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
        selectedKeys={selectedKeys}
        setSelectedKeys={setSelectedKeys}
        allData={{data:data!, isLoading:isLoading}}
      />
  );
}

export default Page;
