"use client";
import { useNewPayhead } from "@/services/queries";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/dist/client/components/navigation";
import { PayheadForm } from "@/components/admin/payroll/PayheadUI";
import axios from "axios";
import { AffectedJson } from "@/types/payroll/payheadType";
import PayheadUpsert from "@/components/admin/payroll/PayheadUpsert";

function Page() {
  const { data, isLoading } = useNewPayhead();
  const router = useRouter();
  const onSubmit = async (values: unknown, employees: number[], affectedJson: AffectedJson) => {
    try {
      await axios.post("/api/admin/payroll/payhead/create", {
        data: values,
        affected: employees,
        affectedJson: affectedJson,
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
    // <PayheadUpsert
      
    // />
  );
}

export default Page;
