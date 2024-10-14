import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TableProvider<T> {
    data: T
}
// Define a generic context type
interface TableContextType<T> {
    data: TableProvider<T> | null;
    setData: (data: TableProvider<T>) => void;
}

// Create the context with default values
const TableContext = createContext<TableContextType<any> | undefined>(undefined);

// Create a generic provider component
export const TableProvider = <T,>({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<TableProvider<T> | null>(null);

    return (
        <TableContext.Provider value={{ data, setData }}>
            {children}
        </TableContext.Provider>
    );
};

// Custom hook for accessing the context

export function useTableData<T>() {
    const context = useContext(TableContext) as TableContextType<T>;
    if (!context) {
        throw new Error('useFormTable must be used within a FormTableProvider');
    }
    return context;
}
