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
import {Alert} from "@nextui-org/alert";

interface ReportTable<T>{
    endpoint: string,
    columns: Omit<TableConfigProps<T>, "rowCell">
    groupByKey?: string
}


export default function ReportTable<T>({endpoint, columns, groupByKey}: ReportTable<T>) {
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

    const groupBy = Object.groupBy(list.items, (item) => item[groupByKey as keyof T] as keyof T);
    const groupByKeys = Object.entries(groupBy);
    console.log("Group By Keys: ", groupByKeys);

    return (
        <>
            {isGenerated || list.items.length > 0 ? groupByKeys.map((key, index) => {

                return(
                    <Table
                        key={index}
                        isHeaderSticky
                        aria-label="Reports Table"
                        baseRef={scrollerRef}
                        sortDescriptor={list.sortDescriptor}
                        onSortChange={list.sort}
                        topContent={
                            key[0] !== "undefined" && <Alert description={key[0]}/>

                        }
                        bottomContent={
                            hasMore ? (
                                <div className="flex w-full justify-center">
                                    <Spinner ref={loaderRef} color="primary"/>
                                </div>
                            ) : null
                        }
                        classNames={{
                            th: ["bg-white", "text-default-500", "border", "border-divider"],
                            td: ["text-default-500", "border", "border-divider", "w-96"],
                            base: "h-full",
                            emptyWrapper: "h-full",
                            loadingWrapper: "h-full",
                            wrapper: `pt-0 px-4 pb-4 bg-transparent rounded-none shadow-none ${key[0] === undefined ? "h-full" : "h-fit"}`,
                        }}
                    >
                        <TableHeader columns={columns.columns}>
                            {(column: { uid: any; name: string; sortable?: boolean }) => (<TableColumn
                                key={column.uid}
                                align={column.uid === "actions" ? "center" : "start"}
                                allowsSorting={column.sortable}
                                maxWidth={100}
                            >
                                {column.name.toUpperCase()}
                            </TableColumn>)}
                        </TableHeader>
                        <TableBody
                            isLoading={isLoading}
                            items={key[1] as T[]}
                            loadingContent={<Spinner color="danger"/>}
                        >
                            {(item: T) => (
                                <TableRow className="w-fit">
                                    {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )
            }): list.items.length === 0 && !isLoading && (<NoData message="No Report Generated"/>)}
        </>
    );
}

