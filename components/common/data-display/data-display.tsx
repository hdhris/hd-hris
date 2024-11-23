"use client"
import React, {Key, ReactNode, useCallback, useEffect} from 'react';
import DataDisplayControl from "@/components/common/data-display/controls/data-display-control";
import {
    DataDisplayControlProvider,
    DisplayType,
    useDataDisplayControl
} from "@/components/common/data-display/provider/data-display-control-provider";
import DataTable from "@/components/common/data-display/data-table";
import {
    DataDisplayControlProps,
    DataImportAndExportProps,
    DataTableProps
} from "@/components/common/data-display/types/types";
import {TableConfigProps} from "@/types/table/TableDataTypes";
import {Case, Switch} from "@/components/common/Switch";
import {Selection} from "@nextui-org/react";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import RenderList from "@/components/util/RenderList";
import {AnimatedList} from '@/components/ui/animated-list';
import Loading from "@/components/spinner/Loading";
import NoData from "@/components/common/no-data/NoData";


interface DataDisplayProps<T> extends RenderDisplayProps<T> {
    data: T[]
    defaultDisplay: DisplayType

}

type DataDisplayType<T> =
    Omit<DataDisplayControlProps<T>, "children" | "isList" | "isGrid" | "isTable" | "isImport" | "isExport" | "onDeleteSelected">
    & DataDisplayProps<T>

function DataDisplay<T extends { id: string | number }>({
                                                            defaultDisplay,
                                                            data,
                                                            searchProps,
                                                            sortProps,
                                                            filterProps,
                                                            className,
                                                            paginationProps,
                                                            buttonGroupProps,
                                                            rowSelectionProps,
                                                            isLoading,
                                                            ...rest
                                                        }: DataDisplayType<T>) {


    return (<DataDisplayControlProvider values={data} defaultDisplay={defaultDisplay}>
        <DataDisplayControl
            title={rest.title}
            className={className}
            searchProps={searchProps}
            buttonGroupProps={buttonGroupProps}
            filterProps={filterProps}
            sortProps={sortProps}
            paginationProps={paginationProps}
            rowSelectionProps={rowSelectionProps}
            isList={!!rest.onListDisplay}
            isGrid={!!rest.onGridDisplay}
            isTable={!!rest.onTableDisplay}
            onExport={rest.onExport}
            onImport={rest.onImport}
            isSelectionDeleted={rest.isSelectionDeleted}
            onDeleteSelected={rest.onDeleteSelected!}
            addFunction={rest.addFunction}

        >
            {(data: T[], sortDescriptor, onSortChange) => {
                return (<RenderDisplay data={data} isLoading={isLoading} onTableDisplay={{
                    ...rest.onTableDisplay!, sortDescriptor: sortDescriptor, onSortChange: onSortChange
                }}
                                       onGridDisplay={rest.onGridDisplay}
                                       onListDisplay={rest.onListDisplay}
                />)
            }}

        </DataDisplayControl>
    </DataDisplayControlProvider>);
}

export default DataDisplay;

interface DataDisplayTableProps<T> extends Omit<DataTableProps<T>, "config"> {
    config?: TableConfigProps<T>;
}


interface RenderDisplayProps<T> {
    isLoading?: boolean
    onTableDisplay?: Omit<DataDisplayTableProps<T>, "data" | "isLoading">;
    onGridDisplay?: (data: T, key: number | string) => ReactNode;
    onListDisplay?: (data: T, key: number | string) => ReactNode;
    onImport?: DataImportAndExportProps;
    onExport?: DataImportAndExportProps;
    onDeleteSelected?: (keys: Selection) => void;
    data: T[];
}

const RenderDisplay = <T extends { id: string | number }>({
                                                              onTableDisplay,
                                                              onGridDisplay,
                                                              onListDisplay,
                                                              data,
                                                              isLoading
                                                          }: RenderDisplayProps<T>) => {

    const newData = data.map(item => ({key: item.id, ...item}));

    const {display} = useDataDisplayControl();
    return (<>{isLoading ? (<Loading/>) : (<Switch expression={display}>
        <Case of="table">
            {onTableDisplay && <DataDisplayTable data={data} {...onTableDisplay} />}
        </Case>
        <Case of="grid">
            <ScrollShadow className="flex-1 px-2 pb-2 max-w-full" size={10}>
                <div
                    className="h-full grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
                    {
                        newData.length > 0 ? <RenderList
                            // onClick={(key) => console.log("Key: ", key)}
                            items={newData}
                            map={(item, key) => (<>
                                {onGridDisplay ? onGridDisplay(item, key) : <p>No grid display available</p>}
                            </>)}
                        /> : <div className="h-full"><NoData/></div>
                    }

                </div>
            </ScrollShadow>
        </Case>

        <Case of="list">
            <ScrollShadow className="w-full h-full p-5 overflow-auto">
                <AnimatedList>
                    <div className="grid grid-row-[repeat(auto-fit,minmax(100%,1fr))] gap-5 w-full">
                        {
                            newData.length > 0 ?  <RenderList
                                items={newData}
                                map={(item, key) => (<>
                                    {onListDisplay ? onListDisplay(item, key) : <p>No grid display available</p>}
                                </>)}
                            /> : <div className="h-full"><NoData/></div>
                        }

                    </div>
                </AnimatedList>
            </ScrollShadow>
        </Case>
    </Switch>)} </>);
};


const DataDisplayTable = <T extends { id: string | number }, >({data, config, ...props}: DataDisplayTableProps<T>) => {
    const {setSelectedKeys} = useDataDisplayControl<T>()
    const onSelectionChange = useCallback((keys: Selection) => {
        if (props.selectionMode === "multiple") {
            setSelectedKeys(keys)
        }
    }, [setSelectedKeys, props.selectionMode])

    useEffect(() => {
        if (props.selectionMode === "multiple") {
            setSelectedKeys(new Set([]))
        }


    }, [props.selectionMode, setSelectedKeys])
    return (<DataTable
        isStriped
        isHeaderSticky
        removeWrapper
        data={data}
        config={config!}
        onSelectionChange={onSelectionChange}
        {...props}
    />)
}