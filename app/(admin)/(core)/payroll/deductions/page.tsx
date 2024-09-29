"use client";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import { usePayheads } from "@/services/queries";
import { Payhead } from "@/types/payroll/payrollType";
import { FilterProps } from "@/types/table/default_config";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip, Selection } from "@nextui-org/react";
import { useRouter } from "next/dist/client/components/navigation";
import axios from "axios";
import TableData from "@/components/tabledata/TableData";
import showDialog from "@/lib/utils/confirmDialog";
import React, { useState } from "react";
import { parseBoolean } from "@/lib/utils/parser/parseClass";

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
      { uid: "status", name: "Status", sortable: true },
      { uid: "action", name: "Action", sortable: false },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return <p className="capitalize">{item.name}</p>;
        case "affected":
          return item.is_mandatory ? (
            <Chip color="primary" variant="bordered">
              Mandatory
            </Chip>
          ) : (
            <Chip color="default" variant="bordered">
              <strong>{item.dim_payhead_affecteds?.length}</strong>{" "}
              {item.dim_payhead_affecteds?.length >= 2
                ? "Employees"
                : "Employee"}
            </Chip>
          );
        case "status":
          return item.is_active ? (
            <Chip color="success" variant="dot">
              Active
            </Chip>
          ) : (
            <Chip color="danger" variant="dot">
              In-active
            </Chip>
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
  const filterItems: FilterProps[] = [
    {
      filtered: [
        { name: "Active", uid: "active_true" },
        { name: "Inactive", uid: "active_false" },
      ],
      category: "Status",
    },
    {
      filtered: [
        { name: "Mandatory", uid: "mandatory_true" },
        { name: "Non-mandatory", uid: "mandatory_false" },
      ],
      category: "Affected",
    },
  ];
  const filterConfig = (keys: Selection) => {
    let filteredItems: Payhead[] = [...data!];

    if (keys !== "all" && keys.size > 0) {
      console.log(Array.from(keys));
      Array.from(keys).forEach((key) => {
        const [uid, value] = (key as string).split("_");
        filteredItems = filteredItems.filter((items) => {
          if (uid.includes("active")) {
            return items.is_active === parseBoolean(value);
          } else if (uid.includes("mandatory")) {
            return items.is_mandatory === parseBoolean(value);
          }
        });
      });
    }

    return filteredItems;
  };
  return (
    <>
      <TableData
        config={config}
        items={data!}
        isLoading={isLoading}
        searchingItemKey={["name"]}
        filterItems={filterItems}
        filterConfig={filterConfig}
        counterName="Deductions"
        className="flex-1 h-[calc(100vh-9.5rem)] overflow-y-auto"
        removeWrapper
        isHeaderSticky
        color={"primary"}
        selectionMode="single"
        aria-label="Deductions"
        endContent={() => (
          <Button
            color="primary"
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
