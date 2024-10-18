import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';

// Define the TableContext
interface DataDisplayContext<T> {
    values: T[];
    setValues: React.Dispatch<React.SetStateAction<T[]>>;
}

// Define context with default values
const TableContext = createContext<DataDisplayContext<any> | undefined>(undefined);

// Hook to use table context
export const useDataDisplay = <T,>(): DataDisplayContext<T> => {
    const context = useContext(TableContext);
    if (!context) {
        throw new Error('useDataDisplay must be used within a DataDisplayProvider');
    }
    return context;
};

// DataDisplayProvider component
interface DatDisplayProviderProps<T> {
    children: ReactNode;
    values: T[];
}

export const DataDisplayProvider = <T,>({ children, values }: DatDisplayProviderProps<T>) => {
    const [dataDisplay, setDataDisplay] = useState<T[]>(values);

    // Sync state with updated values prop
    useEffect(() => {
        setDataDisplay(values);
    }, [values]); // Trigger the effect when `values` changes

    return (
        <TableContext.Provider value={{ values: dataDisplay, setValues: setDataDisplay }}>
            {children}
        </TableContext.Provider>
    );
};