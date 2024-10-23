import React from 'react';
import {
    ScrollShadow, Table, TableBody, TableCell, TableColumn, TableHeader, TableProps, TableRow
} from "@nextui-org/react";
import {TableConfigProps} from "@/types/table/TableDataTypes";
import Loading from "@/components/spinner/Loading";
import {DataTableProps} from "@/components/common/data-display/types/types";

function DataTable<T extends { id: string | number } >({
                          data, config, isLoading = false, emptyContent, ...props
                      }: DataTableProps<T>) {
    const loadingState = isLoading ? "loading" : "idle";
    const emptyContentMessage = data.length === 0 && !isLoading ? emptyContent || 'No data found. Try to refresh' : null;
    return (<ScrollShadow size={20} className='flex-1'>
            <Table
                aria-label="Data Table"
                classNames={{
                    base: "h-full", emptyWrapper: "h-full", loadingWrapper: "h-full", ...props.classNames
                }}
                layout="fixed"
                {...props}

            >
                <TableHeader columns={config.columns}>
                    {(column: { uid: any; name: string; sortable?: boolean }) => (<TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={props.sortDescriptor && props.onSortChange && column.sortable}
                        >
                            {column.name.toUpperCase()}
                        </TableColumn>)}
                </TableHeader>
                <TableBody
                    emptyContent={emptyContentMessage}
                    items={data}
                    loadingContent={<Loading/>}
                    loadingState={loadingState}
                >
                    {(item: T) => (<TableRow key={item.id} className='cursor-pointer'>
                            {(columnKey: React.Key) => (<TableCell key={String(columnKey)} className='py-3'>
                                    {config.rowCell(item, columnKey)}
                                </TableCell>)}
                        </TableRow>)}
                </TableBody>
            </Table>
        </ScrollShadow>);
}

export default DataTable;
