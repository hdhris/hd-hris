"use client";
import React, {Key, useEffect, useState} from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    getKeyValue,
} from "@nextui-org/react";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";
import { useControl } from "@/components/admin/reports/reports-controls/provider/reports-control-provider";
import NoData from "@/components/common/no-data/NoData";
import {TableConfigProps} from "@/types/table/TableDataTypes";

interface ReportTable<T>{
    endpoint: string,
    columns: Omit<TableConfigProps<T>, "rowCell">
}
export default function ReportTable<T>({endpoint, columns}: ReportTable<T>) {
    const { value, isGenerated, setIsGenerated } = useControl();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);

    let list = useAsyncList<T>({
        async load({ signal, cursor }) {
            setIsLoading(true);
            const res = await fetch(
                cursor ||
                `${endpoint}?search=${value.department}&start=${value.date.start}&end=${value.date.end}`,
                // `/api/admin/reports/attendance-logs?search=${value.department}&start=${value.date.start}&end=${value.date.end}`,
                { signal }
            );
            const json = await res.json();

            setHasMore(json.next !== null);
            setIsLoading(false);

            return {
                items: json.results,
                cursor: json.next,
            };
        },
        async sort({ items, sortDescriptor }) {
            const column = sortDescriptor.column as keyof T;

            console.log("Column: ", column);
            return {
                items: items.sort((a, b) => {
                    const first = a[column];
                    const second = b[column];

                    let firstValue = typeof first === "string" ? first.toLowerCase() : first;
                    let secondValue = typeof second === "string" ? second.toLowerCase() : second;

                    let cmp = firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;

                    if (sortDescriptor.direction === "descending") {
                        cmp *= -1;
                    }

                    return cmp;
                }),
            };
        },
    });


    const [loaderRef, scrollerRef] = useInfiniteScroll({
        hasMore,
        onLoadMore: list.loadMore,
    });

    useEffect(() => {
        if (isGenerated) {
            // Reset the list and fetch new data
            list.reload();
            setIsGenerated(false); // Reset `isGenerated` after fetching
        }
    }, [isGenerated, value.department, list, setIsGenerated]);

    return (
        <>
            {isGenerated || list.items.length > 0 ? (
                <Table
                    isHeaderSticky
                    isStriped
                    aria-label="Reports Table"
                    baseRef={scrollerRef}
                    sortDescriptor={list.sortDescriptor}
                    onSortChange={list.sort}
                    bottomContent={
                        hasMore ? (
                            <div className="flex w-full justify-center">
                                <Spinner ref={loaderRef} color="primary"/>
                            </div>
                        ) : null
                    }
                    classNames={{
                        th: ["bg-white", "text-default-500", "border", "border-divider"],
                        td: ["text-default-500", "border", "border-divider"],
                        base: "h-full",
                        emptyWrapper: "h-full",
                        loadingWrapper: "h-full",
                        wrapper: "pt-0 px-4 pb-4 bg-transparent rounded-none shadow-none",
                    }}
                >
                    {/*<TableHeader>*/}
                    {/*    <TableColumn key="id" allowsSorting>ID</TableColumn>*/}
                    {/*    <TableColumn key="employee" allowsSorting>Employee</TableColumn>*/}
                    {/*    <TableColumn key="department" allowsSorting>Department</TableColumn>*/}
                    {/*    <TableColumn key="timestamp">Timestamp</TableColumn>*/}
                    {/*    <TableColumn key="status">Status</TableColumn>*/}
                    {/*    <TableColumn key="created_at">Created At</TableColumn>*/}
                    {/*    <TableColumn key="punch">Punch</TableColumn>*/}
                    {/*</TableHeader>*/}
                    <TableHeader columns={columns.columns}>
                        {(column: { uid: any; name: string; sortable?: boolean }) => (<TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.sortable}
                        >
                            {column.name.toUpperCase()}
                        </TableColumn>)}
                    </TableHeader>
                    <TableBody
                        isLoading={isLoading}
                        items={list.items}
                        loadingContent={<Spinner color="danger"/>}
                    >
                        {(item: T) => (
                            <TableRow>
                                {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            ) : list.items.length === 0 && !isLoading && (<NoData message="No Report Generated"/>)}
        </>
    );
}

