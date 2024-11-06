"use client";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import { usePayheads } from "@/services/queries";
import { Payhead } from "@/types/payroll/payheadType";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip, Selection } from "@nextui-org/react";
import { useRouter } from "next/dist/client/components/navigation";
import axios from "axios";
import TableData from "@/components/tabledata/TableData";
import showDialog from "@/lib/utils/confirmDialog";
import React, { useState } from "react";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import SearchFilter from "@/components/common/filter/SearchFilter";
import { FilterItemsProps } from "@/components/common/filter/FilterItems";

const handleDelete = async (id: Number, name: string) => {
  try {
    const result = await showDialog({
      title: "Confirm Delete",
      message: `Are you sure you want to delete '${name}' ?`,
      preferredAnswer: "no",
    });
    if (result === "yes") {
      await axios.post("/api/admin/payroll/payhead/delete", {
        id: id,
      });
      toast({
        title: "Deleted",
        description: "Deduction deleted successfully!",
        variant: "success",
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
  const router = useRouter();
  const { data, isLoading } = usePayheads("deduction");
  const [deductions, setDeductions] = useState<Payhead[]>([]);
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
          return item.dim_payhead_affecteds.length === 0 ? (
            <div className="flex gap-2">
              {item.affected_json &&
                item.affected_json.department.length > 0 && (
                  <Chip color="default" variant="bordered">
                    <strong>{item.affected_json.department.length}</strong>{" "}
                    {item.affected_json.department.length >= 2
                      ? "Departments"
                      : "Department"}
                  </Chip>
                )}
              {item.affected_json &&
                (item.affected_json.mandatory.probationary ||
                  item.affected_json.mandatory.regular) && (
                  <Chip color="primary" variant="bordered">
                    {item.affected_json.mandatory.probationary &&
                      "Probationary"}
                    {item.affected_json.mandatory.probationary &&
                    item.affected_json.mandatory.regular
                      ? ", "
                      : item.affected_json.mandatory.probationary
                      ? " "
                      : ""}
                    {item.affected_json.mandatory.regular && "Regular"}
                  </Chip>
                )}
            </div>
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
  const filterItems: FilterItemsProps<Payhead>[] = [
    {
      filter: [
        { label: "Active", value: true },
        { label: "Inactive", value: false },
      ],
      key: "is_active",
      sectionName: "Status",
    },
    {
      filter: [
        {
          label: "Probationary",
          value: (item: Payhead) => {
            return item.affected_json.mandatory.probationary === true;
          },
        },
        {
          label: "Regular",
          value: (item: Payhead) => {
            return item.affected_json.mandatory.regular === true;
          },
        },
        {
          label: "Non-mandatory",
          value: (item: Payhead) => {
            return (
              item.affected_json.mandatory.regular === false &&
              item.affected_json.mandatory.probationary === false
            );
          },
        },
      ],
      key: ["affected_json", "mandatory"],
      sectionName: "Mandatory",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <SearchFilter
          searchConfig={[{ key: "name", label: "Name" }]}
          filterConfig={filterItems}
          items={data || []}
          setResults={setDeductions}
        />
        <Button
          {...uniformStyle()}
          className=" w-fit"
          onClick={() => router.push("/payroll/deductions/create")}
        >
          Create Deduction
        </Button>
      </div>
      <TableData
        config={config}
        items={deductions || []}
        isLoading={isLoading}
        title="Earnings"
        selectionMode="single"
      />
    </div>
  );
}

export default Page;
