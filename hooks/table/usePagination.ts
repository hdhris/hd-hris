import React from "react";

interface PaginationProps {
    rowsPerPage?: number;
}

export function usePagination<T>(data: T[], { rowsPerPage = 5 }: PaginationProps = {}) {
    const [page, setPage] = React.useState<number>(1);
    const totalPages = React.useMemo(() => {
        if(!data.length) return 1
        return Math.ceil(data.length / rowsPerPage)
    }, [data.length, rowsPerPage]);
    const paginatedData = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return data.slice(start, end);
    }, [data, page, rowsPerPage]);

    const onPageChange = (newPage: number) => {
        setPage(newPage);
    };
    return {
        page,
        totalPages,
        onPageChange,
        paginatedData
    };
}