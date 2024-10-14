"use client";
import React from "react";
import {
    cn, ScrollShadow, Table, TableBody, TableCell, TableColumn, TableHeader, TableProps, TableRow
} from "@nextui-org/react";
import Loading from "@/components/spinner/Loading";
import {TableConfigProps} from "@/types/table/TableDataTypes";

export type TableHeaderColumn = {
    uid: string; name: string; sortable?: boolean;
};

interface TableProp<T extends { id: string | number }> extends TableProps {
    config: TableConfigProps<T>;
    isLoading?: boolean;
    data: T[]
}

export function DataTable<T extends { id: string | number }>({
                                                                 isLoading, config, data, ...props
                                                             }: TableProp<T>) {
    const loadingState = isLoading ? "loading" : "idle";
    const emptyContent = data.length === 0 && !isLoading && 'No data found. Try to refresh';
    return (<ScrollShadow size={20} className="flex-1">
        <Table
            removeWrapper
            isHeaderSticky
            classNames={{
                base: "h-full", emptyWrapper: "h-full", loadingWrapper: "h-full",
            }}
            {...props}
        >
            <TableHeader columns={config.columns}>
                {(column: {
                    uid: any;
                    name: string;
                    sortable?: boolean,
                    columnAlignment?: "center" | "left" | "right",
                    columnClassName?: string
                }) => (<TableColumn
                    key={column.uid}
                    align={column.uid === "actions" ? "center" : "start"}
                    allowsSorting={column.sortable}
                    className={cn("text-foreground-500", `text-${column.columnAlignment ?? "left"}`, column.columnClassName)}
                >
                    {column.name.toUpperCase()}
                </TableColumn>)}
            </TableHeader>
            <TableBody
                emptyContent={emptyContent}
                items={data}
                loadingContent={<Loading/>}
                loadingState={loadingState}
            >
                {(item: T) => (<TableRow key={item.id}
                                         className={props.onRowAction ? "cursor-pointer" : "cursor-default"}>
                    {(columnKey: React.Key) => {
                        const row = config.columns.find(column => column.uid === columnKey)
                        return (<TableCell key={String(columnKey)}
                                           className={cn("py-3", `text-${row?.columnAlignment ?? "left"}`, row?.rowClassName)}>
                            {config.rowCell(item, columnKey)}
                        </TableCell>)
                    }}
                </TableRow>)}
            </TableBody>
        </Table>
    </ScrollShadow>);
}
