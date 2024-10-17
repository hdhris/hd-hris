import React, {useState} from 'react';
import useSearch from "@/hooks/utils/useSearch";
import useFilter from "@/hooks/utils/useFilter";
import {usePagination} from "@/hooks/utils/usePagination";
import {useSort} from "@/hooks/utils/useSort";
import {ButtonGroup, cn, Pagination, Selection, SortDescriptor} from "@nextui-org/react";
import {NestedKeys} from "@/hooks/types/types";
import TableSearch from "@/components/util/search";
import TableFilter from "@/components/util/filter";
import {filterLeaveTypes} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import Sort from "@/components/util/sort";
import DataTable from "@/components/common/data-display/data-table";
import {TableConfigProps} from "@/types/table/TableDataTypes";
import {DataTableProps} from "@/components/common/data-display/types/types";
import {Button} from "@nextui-org/button";
import {LuLayoutGrid, LuLayoutList, LuTable2} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";
import {Tooltip} from "@nextui-org/tooltip";
import Typography from "@/components/common/typography/Typography";

interface ChildrenProps<T> {
    data: T[];
    onSortChange?: (sort: SortDescriptor) => void;
    sortDescriptor?: SortDescriptor;

}

interface DataControlsProps<T> {
    data: T[];
    search?: NestedKeys<T>[];
    children: (child: ChildrenProps<T>) => React.ReactNode;
    selectedKeys?: Selection
    isTable?: boolean
    isGrid?: boolean
    isList?: boolean
}

interface DataDisplayTableProps<T> extends Omit<DataTableProps<T>, "data"> {
    config: TableConfigProps<T>;
    data: T[];
}

interface DataDisplayProps<T> {
    data: T[];
    onTableDisplay?: DataDisplayTableProps<T>;

}


function DataDisplay<T extends { id: string | number }>({
                                                            data, onTableDisplay,
                                                        }: DataDisplayProps<T>) {

    const [selected, setSelected] = useState<Selection>(new Set([]));

    return (<DataControls
        data={data}
    >
        {({data, onSortChange, sortDescriptor}) => {
            if (onTableDisplay) {
                return (<DataDisplayTable
                    data={data}
                    config={onTableDisplay.config} // Non-null assertion since onTableDisplay is required here
                    onSortChange={onSortChange}
                    sortDescriptor={sortDescriptor}

                />)
            }
        }}
    </DataControls>);
}

const DataControls = <T, >({
                               data, search, children, selectedKeys, isTable, isGrid, isList
                           }: DataControlsProps<T>) => {
    const {searchValue, onSearchChange, itemSearched} = useSearch<T>(data, search)
    const {filteredItems, onFilterChange, filter} = useFilter<T>(itemSearched)
    const {paginatedData, onPageChange, totalPages, page} = usePagination<T>(filteredItems, {rowsPerPage: 10})
    const {sortedItems, onSortChange, sortDescriptor} = useSort<T>(paginatedData)

    const handleOnSearch = (value: string) => {
        onSearchChange(value)
        onPageChange(1)
    }

    const handleOnFilterChange = (value: Selection) => {
        onFilterChange(value)
        onPageChange(1)
    }


    return (<div className="flex flex-col h-full">
        {/* Top controls: TableSearch, TableFilter, and Sort */}
        <div className="sticky top-0 z-10 bg-white p-5 shadow-sm flex gap-2">
            <TableSearch value={searchValue} onChange={handleOnSearch} searchingItemKey={search}/>
            <TableFilter
                filterValue={filter}
                filterItems={filterLeaveTypes}
                onChange={handleOnFilterChange}
            />
            <Sort
                sortItems={[{name: "Name", key: "name"}, {name: "Created At", key: "created_at"},]}
                onSortChange={onSortChange}
                initialValue={sortDescriptor}
            />
        </div>

        {children({data: sortedItems, onSortChange, sortDescriptor})}
        {/* Bottom pagination */}
        <div className="sticky bottom-0 z-10 bg-white p-5 shadow-sm flex justify-between items-center w-full">
            <div className="flex justify-start">
                <Typography className="text-medium font-semibold text-default-400">
                    {selectedKeys ? (selectedKeys === "all" ? "All items selected" : `${selectedKeys.size} of ${sortedItems.length} selected`) : ''}
                </Typography>

            </div>
            {/* Pagination centered */}
            <div className="flex-1 flex justify-center">
                <Pagination
                    showControls
                    total={totalPages}
                    page={page}
                    onChange={onPageChange}
                />
            </div>

            <div className="flex justify-end">
                <ButtonGroup variant="light" color="primary" isIconOnly>
                    {isTable && (<Tooltip content="Table">
                        <Button>
                            <LuTable2 className={cn("text-slate-700", icon_size_sm)}/>
                        </Button>
                    </Tooltip>)}
                    {isGrid && (<Tooltip content="Grid">
                        <Button>
                            <LuLayoutGrid className={cn("text-slate-700", icon_size_sm)}/>
                        </Button>
                    </Tooltip>)}
                    {isList && (<Tooltip content="List">
                        <Button>
                            <LuLayoutList className={cn("text-slate-700", icon_size_sm)}/>
                        </Button>

                    </Tooltip>)}
                </ButtonGroup>
            </div>

        </div>

    </div>)
}


const DataDisplayTable = <T extends { id: string | number }, >({data, config, ...props}: DataDisplayTableProps<T>) => {
    return (<DataTable
        isStriped
        isHeaderSticky
        removeWrapper
        data={data}
        config={config}
        // onSortChange={onSortChange}
        // sortDescriptor={sortDescriptor}
        {...props}
    />)
}

export default DataDisplay;