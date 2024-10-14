"use client"
import React, {useMemo, useState} from "react";
import {Pagination} from "@nextui-org/react";
import {useTableData} from "@/isolatedPages/data-table/TableProvider";

interface PaginationControlProps {
    totalPages: number;
    onPageChange: (page: number) => void;
    selectedCount: number;
    totalItems: number;
}

export function PaginationControl<T>({
                                      totalPages, onPageChange, selectedCount, totalItems,
                                  }: PaginationControlProps) {
    const {data} = useTableData<T>()
    const [page, setPage] = useState(1);
    const rows = useMemo(() => {
        if(data) return data
        return []
    }, [data])
    return (
        <div className="flex justify-between items-center py-4">
            <Pagination page={page} total={totalPages} onChange={onPageChange}/>
            <span className="text-small text-default-400">
        Selected {selectedCount} of {totalItems}
      </span>
        </div>);
}
