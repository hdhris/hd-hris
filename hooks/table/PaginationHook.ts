import { useState } from 'react';

function usePagination<T>(items: T[], rowsPerPage: number) {
    const [page, setPage] = useState(1);

    const paginatedItems = items.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const totalPages = Math.ceil(items.length / rowsPerPage);

    return { paginatedItems, page, setPage, totalPages };
}

export default usePagination;
