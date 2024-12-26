import React, {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";

interface PaginationProps {
    rowsPerPage?: number;
    totalItems?: number
}

export function usePagination<T>(data: T[], {rowsPerPage = 5, totalItems = 1}: PaginationProps = {}) {
    const router = useRouter()
    // const search = useSearchParams()
    const [page, setPage] = React.useState<number>(1);
    const [rows, setRows] = React.useState<number>(rowsPerPage);


    const totalPages = React.useMemo(() => {
        // const searchParams = new URLSearchParams(search);
        // const initialPage = Number(searchParams.get("page")) || 1;

        let total: number;
        if(totalItems > data.length){
            total = totalItems ? Math.ceil(totalItems / rows) : 0
        } else{
            total = data.length ? Math.ceil(data.length / rows) : 0;
        }

        // if (initialPage > total) {
        //     // searchParams.set("page", "1");
        //     // router.push(`?${searchParams.toString()}`);
        //     // window.history.replaceState(null, "", `?${searchParams.toString()}`);
        //     setPage(1);
        // } else {
        //     setPage(initialPage);
        // }

        return total;
    }, [data.length, rows, totalItems]);



    const paginatedData = React.useMemo(() => {
        const start = (page - 1) * rows;
        const end = start + rows;
        return data.slice(start, end);
    }, [data, page, rows]);

    const onPageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) {
            return;
        }
        // const searchParams = new URLSearchParams(search);
        // searchParams.set("page", newPage.toString());
        // router.replace(`?${searchParams.toString()}`);
        setPage(newPage);
    };

    // console.log("Total:", totalItems)
    return {
        rows, page, totalPages, onPageChange, paginatedData, setRows, totalRows: totalItems
    };
}