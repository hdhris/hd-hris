import React, {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';
import {DataDisplayProvider} from "@/components/common/data-display/provider/data-display-provider";
import DataDisplayControl from "@/components/common/data-display/controls/data-display-control";
import {
    DataDisplayControlProvider, useDataDisplayControl
} from "@/components/common/data-display/provider/data-display-control-provider";
import DataTable from "@/components/common/data-display/data-table";
import {DataDisplayControlProps, DataTableProps} from "@/components/common/data-display/types/types";
import {TableConfigProps} from "@/types/table/TableDataTypes";
import {Case, Switch} from "@/components/common/Switch";
import {Selection} from "@nextui-org/react";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import Typography from "@/components/common/typography/Typography";


interface DataDisplayProps<T> extends RenderDisplayProps<T> {
    data: T[]
}

type DataDisplayType<T> = Omit<DataDisplayControlProps<T>, "children" | "isList" | "isGrid" | "isTable"> & DataDisplayProps<T>

function DataDisplay<T extends { id: string | number }>({
                                                            data,
                                                            searchProps,
                                                            sortProps,
                                                            filterProps,
                                                            className,
                                                            paginationProps,
                                                            buttonGroupProps,
                                                            ...rest
                                                        }: DataDisplayType<T>) {


    return (<DataDisplayProvider values={data}>
        <DataDisplayControlProvider>
            <DataDisplayControl
                className={className}
                searchProps={searchProps}
                buttonGroupProps={buttonGroupProps}
                filterProps={filterProps}
                sortProps={sortProps}
                paginationProps={paginationProps}
                isList={!!rest.onListDisplay}
                isGrid={!!rest.onGridDisplay}
                isTable={!!rest.onTableDisplay}
            >
                {(data: T[], sortDescriptor, onSortChange) => {
                    return (<RenderDisplay data={data} onTableDisplay={{
                        ...rest.onTableDisplay, sortDescriptor, onSortChange
                    }} onGridDisplay={rest.onGridDisplay} onListDisplay={rest.onListDisplay}/>)
                }}

            </DataDisplayControl>
        </DataDisplayControlProvider>

    </DataDisplayProvider>);
}

export default DataDisplay;

interface DataDisplayTableProps<T> extends DataTableProps<T> {
    config: TableConfigProps<T>;
}


interface RenderDisplayProps<T> {
    onTableDisplay: Omit<DataDisplayTableProps<T>, "data">;
    onGridDisplay?: (data: T[]) => ReactNode;
    onListDisplay?: (data: T[]) => ReactNode;
    data: T[];
}

const RenderDisplay = <T extends { id: string | number }>({
                                                              onTableDisplay,
                                                              onGridDisplay,
                                                              onListDisplay,
                                                              data
                                                          }: RenderDisplayProps<T>) => {

    const { display } = useDataDisplayControl();
    return (
        <Switch expression={display}>
            <Case of="table">
                <DataDisplayTable data={data} {...onTableDisplay} />
            </Case>

            <Case of="grid">
                <ScrollShadow className="flex-1">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] place-items-center gap-5">
                        {onGridDisplay ? onGridDisplay(data) : <p>No grid display available</p>}
                    </div>
                </ScrollShadow>
            </Case>

            <Case of="list">
                <ScrollShadow className="w-full h-full p-5 overflow-auto">
                    <div className="grid place-items-center">
                        {onListDisplay ? onListDisplay(data) : (
                            <Typography className="text-primary font-semibold text-large">
                                Not implemented
                            </Typography>
                        )}
                    </div>
                </ScrollShadow>
            </Case>
        </Switch>
    );
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
        config={config}
        onSelectionChange={onSelectionChange}
        // onSortChange={setSortDescriptor}
        // sortDescriptor={sortDescriptor!}
        {...props}
    />)
}