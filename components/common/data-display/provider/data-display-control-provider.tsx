import React, {createContext, useContext, useEffect, useState} from "react";
import {Selection, SortDescriptor} from "@nextui-org/react";
import {useDataDisplay} from "@/components/common/data-display/provider/data-display-provider";

export type DisplayType = "table" | "grid" | "list"
interface DataDisplayControlContext<T> {
    values: T[]
    setValues: (values: T[]) => void
    selectedKeys: Selection | null
    setSelectedKeys: (keys: Selection) => void
    display: DisplayType
    setDisplay: (display: DisplayType) => void
    sortDescriptor: SortDescriptor | null
    setSortDescriptor: (sortDescriptor: SortDescriptor) => void
}

const DataDisplayControlContext = createContext<DataDisplayControlContext<any> | undefined>(undefined)

export const useDataDisplayControl = <T,>(): DataDisplayControlContext<T> => {
    const context = useContext(DataDisplayControlContext)
    if (!context) {
        throw new Error('useDataDisplayControl must be used within a DataDisplayControlProvider')
    }
    return context
}

interface DataDisplayControlProviderProps<T> {
    children: React.ReactNode
    values: T[]
    defaultDisplay: DisplayType
}




export const DataDisplayControlProvider = <T,>({children, values, defaultDisplay}: DataDisplayControlProviderProps<T>) => {
    // const {values} = useDataDisplay<T>()
    const [dataDisplay, setDataDisplay] = useState<T[]>(values);
    const [selectedKeys, setSelectedKeys] = useState<Selection | null>(null)
    const [display, setDisplay] = useState<DisplayType>(defaultDisplay)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | null>(null)


    useEffect(() => {
        setDataDisplay(values);
    }, [values]); // Trigger the effect when `values` changes

    useEffect(() => {
        setDisplay(defaultDisplay);
    }, [defaultDisplay]);
    return (
        <DataDisplayControlContext.Provider
            value={{
                values: dataDisplay,
                setValues: setDataDisplay,
                selectedKeys,
                setSelectedKeys,
                display,
                setDisplay,
                setSortDescriptor,
                sortDescriptor
            }}
        >
            {children}
        </DataDisplayControlContext.Provider>
    )
}