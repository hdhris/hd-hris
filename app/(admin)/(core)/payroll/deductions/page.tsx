"use client";
import { TableActionButton } from "@/components/actions/ActionButton";
import TableData from "@/components/tabledata/TableData";
import { toast } from "@/components/ui/use-toast";
import showDialog from "@/lib/utils/confirmDialog";
import { usePayheads } from "@/services/queries";
import { Payhead } from "@/types/payroll/payrollType";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip } from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/dist/client/components/navigation";
import React, { useState } from "react";

const handleDelete = async (id: Number, name: string) => {
  try {
    const result = await showDialog(
      "Confirm Delete",
      `Are you sure you want to delete '${name}' ?`,
      false
    );
    if (result === "yes") {
      await axios.post("/api/admin/payroll/payhead/delete", {
        id: id,
      });
      toast({
        title: "Deleted",
        description: "Deduction deleted successfully!",
        variant: "warning",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Error: " + error,
      variant: "danger",
    });
  }
};

function Page() {
  const { data, isLoading } = usePayheads("deduction");
  const router = useRouter();
  const config: TableConfigProps<Payhead> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "affected", name: "Affected", sortable: true },
      { uid: "action", name: "Action", sortable: false },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return <p className="capitalize">{item.name}</p>;
        case "affected":
          return item.is_mandatory ? (
            <Chip color="primary">Mandatory</Chip>
          ) : (
            <Chip color="default">{item.dim_payhead_affecteds?.length} employees</Chip>
          );
        case "action":
          return (
            <TableActionButton
              name={item.name}
              onEdit={() => router.push(`/payroll/deductions/${item.id}`)}
              onDelete={() => {
                handleDelete(item.id, item.name);
              }}
            />
          );
        default:
          return <></>;
      }
    },
  };
  return (
    <>
      <TableData
        config={config}
        items={data!}
        isLoading={isLoading}
        searchingItemKey={["name"]}
        counterName="Deductions"
        className="flex-1 h-[calc(100vh-9.5rem)] overflow-y-auto"
        removeWrapper
        isHeaderSticky
        color={"primary"}
        selectionMode="single"
        aria-label="Deductions"
        endContent={() => (
          <Button
            className=" w-fit"
            onClick={() => router.push("/payroll/deductions/create")}
          >
            Create Deduction
          </Button>
        )}
      />
    </>
  );
}

export default Page;
