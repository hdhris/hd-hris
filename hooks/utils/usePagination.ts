import React from "react";
import {useRouter} from "next/navigation";

interface PaginationProps {
    rowsPerPage?: number;
}

export function usePagination<T>(data: T[], {rowsPerPage = 5}: PaginationProps = {}) {
    const router = useRouter()
    const [page, setPage] = React.useState<number>(1);
    const [rows, setRows] = React.useState<number>(rowsPerPage);
    const totalPages = React.useMemo(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const initialPage = Number(searchParams.get("page")) || 1;

        if (!data.length) {
            console.log("No data");
            return 1;
        }
        const total = Math.ceil(data.length / rows);

        if (initialPage > total) {
            searchParams.set("page", "1");
            window.history.replaceState(null, "", `?${searchParams.toString()}`);
            setPage(1);
        } else {
            setPage(initialPage);
        }

        return total;
    }, [data.length, rows]);


    const paginatedData = React.useMemo(() => {
        const start = (page - 1) * rows;
        const end = start + rows;

        return data.slice(start, end);
    }, [data, page, rows]);

    const onPageChange = (newPage: number) => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("page", newPage.toString());
        router.replace(`?${searchParams.toString()}`);
        setPage(newPage);
    };
    return {
        rows, page, totalPages, onPageChange, paginatedData, setRows
    };
}