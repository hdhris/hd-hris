import React from 'react';
import useSearch from "@/hooks/utils/useSearch";
import useFilter from "@/hooks/utils/useFilter";
import {usePagination} from "@/hooks/utils/usePagination";
import {useSort} from "@/hooks/utils/useSort";
import {ButtonGroup, cn, Pagination, Selection} from "@nextui-org/react";
import Search from "@/components/util/search";
import Filter from "@/components/util/filter";
import Sort from "@/components/util/sort";
import Typography from "@/components/common/typography/Typography";
import {Tooltip} from "@nextui-org/tooltip";
import {Button} from "@nextui-org/button";
import {LuLayoutGrid, LuLayoutList, LuTable2} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";
import {useDataDisplay} from "@/components/common/data-display/provider/data-display-provider";
import {useDataDisplayControl} from "@/components/common/data-display/provider/data-display-control-provider";
import {Case, Switch} from "@/components/common/Switch";
import {DataDisplayControlProps} from "@/components/common/data-display/types/types";

function DataDisplayControl<T>({
                                   children,
                                   searchProps,
                                   sortProps,
                                   filterProps,
                                   className,
                                   paginationProps,
                                   buttonGroupProps,
                                   isTable,
                                   isGrid,
                                   isList
                               }: DataDisplayControlProps<T>) {
    const {values} = useDataDisplay<T>()
    const {selectedKeys, display, setDisplay, setSortDescriptor} = useDataDisplayControl()
    const {searchValue, onSearchChange, itemSearched} = useSearch<T>(values, searchProps.searchingItemKey)
    const {filteredItems, onFilterChange, filter} = useFilter<T>(itemSearched)
    const {paginatedData, onPageChange, totalPages, page} = usePagination<T>(filteredItems)
    const {sortedItems, onSortChange, sortDescriptor} = useSort<T>(paginatedData)

    const handleOnSearch = (value: string) => {
        onSearchChange(value)
        onPageChange(1)
    }

    const handleOnFilterChange = (value: Selection) => {
        onFilterChange(value)
        onPageChange(1)
    }


    return (<div className={cn("flex flex-col h-full", className?.wrapper)}>

        <div className={cn("sticky top-0 z-10 bg-white p-5 shadow-sm flex gap-2", className?.upper)}>
            <Search value={searchValue} onChange={handleOnSearch} {...searchProps}/>
            <Filter
                filterValue={filter}
                onChange={handleOnFilterChange}
                {...filterProps!}
            />
            <Sort
                onSortChange={onSortChange}
                initialValue={sortDescriptor}
                {...sortProps}
            />
        </div>

        {/*<div className={cn("flex-1 h-full", className?.content)}>*/}
        {children(sortedItems, sortDescriptor, setSortDescriptor)}
        {/*</div>*/}

        {/* Bottom pagination */}
        <div
            className={cn("sticky bottom-0 z-10 bg-white p-5 shadow-sm flex justify-between items-center w-full", className?.lower)}>
            <div className={cn("flex justify-start", className?.lower.selectedKeysClassname)}>
                <Typography className="text-medium font-semibold text-primary/50">
                    {selectedKeys ? (selectedKeys === "all" ? "All items selected" : `${selectedKeys.size} of ${values.length} selected`) : ''}
                </Typography>

            </div>
            {/* Pagination centered */}
            <div className={cn("flex-1 flex justify-center", className?.lower.paginationClassname)}>
                <Pagination
                    showControls
                    total={totalPages}
                    page={page}
                    onChange={onPageChange}
                    {...paginationProps}
                />
            </div>

            <div className={cn("flex justify-end", className?.lower.buttonClassname)}>
                <ButtonGroup variant="light" color="primary" isIconOnly {...buttonGroupProps}>
                    {isTable && (
                        <Tooltip content="Table">
                            <Button onClick={() => setDisplay("table")}>
                                <LuTable2 className={cn("text-slate-700", icon_size_sm)}/>
                            </Button>
                        </Tooltip>
                    )}

                    {isGrid && (
                        <Tooltip content="Grid">
                            <Button onClick={() => setDisplay("grid")}>
                                <LuLayoutGrid className={cn("text-slate-700", icon_size_sm)}/>
                            </Button>
                        </Tooltip>
                    )}

                    {isList && (
                        <Tooltip content="List">
                            <Button onClick={() => setDisplay("list")}>
                                <LuLayoutList className={cn("text-slate-700", icon_size_sm)}/>
                            </Button>
                        </Tooltip>
                    )}
                </ButtonGroup>
            </div>

        </div>

    </div>)
}

export default DataDisplayControl;