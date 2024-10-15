import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

// Define the TableContext
interface TableContextProps<T> {
    items: T[];
    filter: Set<string>;
    setFilter: (filter: Set<string>) => void;
    selectedKeys: Set<string>;
    setSelectedKeys: (keys: Set<string>) => void;
    rowsPerPage: number;
    setRowsPerPage: (rows: number) => void;
    page: number;
    setPage: (page: number) => void;
}

// Define context with default values
const TableContext = createContext<TableContextProps<any> | undefined>(undefined);

// Hook to use table context
export const useTableContext = <T,>(): TableContextProps<T> => {
    const context = useContext(TableContext);
    if (!context) {
        throw new Error('useTableContext must be used within a TableProvider');
    }
    return context;
};

// TableProvider component
interface TableProviderProps<T> {
    children: ReactNode;
    items: T[];
}

export const TableProvider = <T,>({ children, items }: TableProviderProps<T>) => {
    const [filter, setFilter] = useState<Set<string>>(new Set());
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(1);

    const value = useMemo(
        () => ({
            items,
            filter,
            setFilter,
            selectedKeys,
            setSelectedKeys,
            rowsPerPage,
            setRowsPerPage,
            page,
            setPage,
        }),
        [items, filter, selectedKeys, rowsPerPage, page]
    );

    return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
};
