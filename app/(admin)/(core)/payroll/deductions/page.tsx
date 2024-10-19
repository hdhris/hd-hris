"use client";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import { usePayheads } from "@/services/queries";
import { Payhead } from "@/types/payroll/payheadType";
import { FilterProps } from "@/types/table/default_config";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip, Selection } from "@nextui-org/react";
import { useRouter } from "next/dist/client/components/navigation";
import axios from "axios";
import TableData from "@/components/tabledata/TableData";
import showDialog from "@/lib/utils/confirmDialog";
import React from "react";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";

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
  const filterItems: FilterProps[] = [
    {
      filtered: [
        { name: "Active", key: 'is_active', value: true},
        { name: "Inactive", key: 'is_active', value: false },
      ],
      category: "Status",
    },
    {
      filtered: [
        { name: "Probationary", key: 'affected_json.mandatory.probationary', value: true },
        { name: "Regular", key: 'affected_json.mandatory.regular', value: true },
      ],
      category: "Mandatory",
    },
  ];

  return (
    <div className="h-fit-navlayout">
      <TableData
        config={config}
        items={data || []}
        isLoading={isLoading}
        searchingItemKey={["name"]}
        filterItems={filterItems}
        counterName="Deductions"
        className="h-full"
        isHeaderSticky
        selectionMode="single"
        aria-label="Deductions"
        endContent={() => (
          <Button
            {...uniformStyle()}
            className=" w-fit"
            onClick={() => router.push("/payroll/deductions/create")}
          >
            Create Deduction
          </Button>
        )}
      />
    </div>
  );
}

export default Page;
