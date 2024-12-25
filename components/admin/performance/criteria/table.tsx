"use client"
import TableData from "@/components/tabledata/TableData";
import { useQuery } from "@/services/queries";
import { CriteriaDetail } from "@/types/performance/types";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Chip } from "@nextui-org/react";
import { toUpper } from "lodash";
import React from "react";

function CriteriaTable() {
    const { data, isLoading, mutate } = useQuery<CriteriaDetail[]>("/api/admin/performance/criteria");

    return <div className="flex w-full h-full">
        <TableData config={config} items={data || []} isLoading={isLoading} />

    </div>;
}

const config: TableConfigProps<CriteriaDetail> = {
    columns: [
        { uid: "name", name: "Name", sortable: true },
        { uid: "desc", name: "Description" },
        { uid: "type", name: "Type" },
        { uid: "status", name: "Status" },
    ],
    rowCell: (item, columnKey) => {
        switch (columnKey) {
            case "name":
                return <strong>{item.name}</strong>;
            case "desc":
                return <p>{item.description}</p>;
            case "type":
                return (
                    <Chip color="primary" size="sm" variant="faded">
                        {toUpper(item.type.replaceAll("-", " "))}
                    </Chip>
                );
            case "status":
                return (
                    <Chip color={item.is_active ? "success" : "danger"} size="sm" variant="flat">
                        {item.is_active ? "Active" : "In-active"}
                    </Chip>
                );
            default:
                return <></>;
        }
    },
};

export default CriteriaTable;
