"use client";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import { usePayheads } from "@/services/queries";
import { Payhead } from "@/types/payroll/payheadType";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip, Selection } from "@nextui-org/react";
import { useRouter } from "next/dist/client/components/navigation";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { FilterItemsProps } from "@/components/common/filter/FilterItems";
import { capitalize } from "lodash";
import axios from "axios";
import TableData from "@/components/tabledata/TableData";
import showDialog from "@/lib/utils/confirmDialog";
import React, { useState } from "react";
import SearchFilter from "@/components/common/filter/SearchFilter";

function PayheadUI({ payhead_type }: { payhead_type: string }) {
    const router = useRouter();
    const { data, isLoading } = usePayheads(payhead_type);
    const [payheads, setPayheads] = useState<Payhead[]>([]);
    const config: TableConfigProps<Payhead> = {
        columns: [
            { uid: "name", name: "Name", sortable: true },
            { uid: "affected", name: "Affected", sortable: true },
            { uid: "status", name: "Status", sortable: true },
            { uid: "action", name: "Action", sortable: false },
        ],
        rowCell: (item, columnKey) => {
            const mandatory = item.affected_json.mandatory;
            const employees = item.affected_json.employees;
            const departments = item.affected_json.departments;
            const roles = item.affected_json.job_classes;

            switch (columnKey) {
                case "name":
                    return <p className="capitalize">{item.name}</p>;
                case "affected":
                    return (
                        <div className="flex gap-4">
                            {mandatory.probationary || mandatory.regular ? (
                                <Chip color="primary" variant="bordered">
                                    {mandatory.probationary && mandatory.regular && "Probationaries and Regulars"}
                                    {mandatory.probationary && !mandatory.regular && "Probationaries only"}
                                    {!mandatory.probationary && mandatory.regular && "Regulars only"}
                                </Chip>
                            ) : (
                                <Chip color="primary" variant="bordered">
                                    <strong>{employees === "all" ? "All associated" : employees.length}</strong>{" "}
                                    employees selected
                                </Chip>
                            )}
                            {
                                <Chip color="default" variant="bordered">
                                    <strong>{departments === "all" ? "All" : departments.length}</strong> departments
                                </Chip>
                            }
                            {
                                <Chip color="default" variant="bordered">
                                    <strong>{employees === "all" ? "All" : employees.length}</strong> job classes
                                </Chip>
                            }
                        </div>
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
                            onEdit={() => router.push(`/payroll/${payhead_type}s/manage?id=${item.id}`)}
                            onDelete={() => {
                                if (item.system_only) {
                                    toast({ title: `System ${payhead_type} cannot be deleted`, variant: "warning" });
                                } else {
                                    handleDelete(item.id, item.name);
                                }
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

    const handleDelete = async (id: Number, name: string) => {
        try {
            const result = await showDialog({
                title: `Delete ${payhead_type}`,
                message: `Are you sure you want to delete '${name}' ?`,
                preferredAnswer: "no",
            });
            if (result === "yes") {
                await axios.post("/api/admin/payroll/payhead/delete", { id });
                toast({
                    description: `${capitalize(payhead_type)} deleted successfully!`,
                    variant: "success",
                });
            }
        } catch (error) {
            toast({
                title: "Something went wrong",
                description: String(error),
                variant: "danger",
            });
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <SearchFilter
                    searchConfig={[{ key: "name", label: "Name" }]}
                    filterConfig={filterItems}
                    items={data || []}
                    setResults={setPayheads}
                />
                <Button
                    {...uniformStyle()}
                    className=" w-fit"
                    onClick={() => router.push(`/payroll/${payhead_type}s/manage`)}
                >
                    Create {payhead_type}
                </Button>
            </div>
            <TableData
                config={config}
                items={payheads || []}
                isLoading={isLoading}
                title="Earnings"
                selectionMode="single"
            />
        </div>
    );
}

export default PayheadUI;
