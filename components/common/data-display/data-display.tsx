import React, {ReactNode, useCallback, useEffect} from 'react';
import DataDisplayControl from "@/components/common/data-display/controls/data-display-control";
import {
    DataDisplayControlProvider,
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


interface DataDisplayProps<T> extends RenderDisplayProps<T> {
    data: T[]
}

type DataDisplayType<T> =
    Omit<DataDisplayControlProps<T>, "children" | "isList" | "isGrid" | "isTable" | "isImport" | "isExport">
    & DataDisplayProps<T>

function DataDisplay<T extends { id: string | number }>({
                                                            data,
                                                            searchProps,
                                                            sortProps,
                                                            filterProps,
                                                            className,
                                                            paginationProps,
                                                            buttonGroupProps,
                                                            rowSelectionProps,
                                                            ...rest
                                                        }: DataDisplayType<T>) {


    return (<DataDisplayControlProvider values={data}>
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
        >
            {(data: T[], sortDescriptor, onSortChange) => {
                return (<RenderDisplay data={data} onTableDisplay={{
                    ...rest.onTableDisplay, sortDescriptor, onSortChange
                }}
                                       onGridDisplay={rest.onGridDisplay}
                                       onListDisplay={rest.onListDisplay}
                />)
            }}

        </DataDisplayControl>
    </DataDisplayControlProvider>);
}

export default DataDisplay;

interface DataDisplayTableProps<T> extends DataTableProps<T> {
    config: TableConfigProps<T>;
}


interface RenderDisplayProps<T> {
    onTableDisplay: Omit<DataDisplayTableProps<T>, "data">;
    onGridDisplay?: (data: T, key: number | string) => ReactNode;
    onListDisplay?: (data: T, key: number | string) => ReactNode;
    onImport?: DataImportAndExportProps;
    onExport?: DataImportAndExportProps;
    data: T[];
    query?: string
}

const RenderDisplay = <T extends { id: string | number }>({
                                                              onTableDisplay, onGridDisplay, onListDisplay, data, query
                                                          }: RenderDisplayProps<T>) => {

    const newData = data.map(item => ({key: item.id, ...item}));

    const {display} = useDataDisplayControl();
    return (<Switch expression={display}>
        <Case of="table">
            <DataDisplayTable data={data} {...onTableDisplay} />
        </Case>

        <Case of="grid">
            <ScrollShadow className="flex-1">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] place-items-center gap-5">
                    <RenderList
                        items={newData}
                        map={(item, key) => (<>
                            {onGridDisplay ? onGridDisplay(item, key) : <p>No grid display available</p>}
                        </>)}
                    />
                </div>
            </ScrollShadow>
        </Case>

        <Case of="list">
            <ScrollShadow className="w-full h-full p-5 overflow-auto">
                <AnimatedList>
                    <div className="grid grid-row-[repeat(auto-fit,minmax(100%,1fr))] gap-5 w-full">
                        <RenderList
                            items={newData}
                            map={(item, key) => (<>
                                {onListDisplay ? onListDisplay(item, key) : <p>No grid display available</p>}
                            </>)}
                        />
                    </div>
                </AnimatedList>
            </ScrollShadow>
        </Case>
    </Switch>);
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