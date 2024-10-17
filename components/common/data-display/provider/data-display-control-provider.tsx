import React, {createContext, useContext, useState} from "react";
import {Selection, SortDescriptor} from "@nextui-org/react";
import {useDataDisplay} from "@/components/common/data-display/provider/data-display-provider";

type DisplayType = "table" | "grid" | "list"
interface DataDisplayControlContext<T> {
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

interface DataDisplayControlProviderProps {
    children: React.ReactNode
}




export const DataDisplayControlProvider = ({children}: DataDisplayControlProviderProps) => {
    // const {values} = useDataDisplay<T>()
    const [selectedKeys, setSelectedKeys] = useState<Selection | null>(null)
    const [display, setDisplay] = useState<DisplayType>("table")
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | null>(null)


    return (
        <DataDisplayControlContext.Provider
            value={{
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