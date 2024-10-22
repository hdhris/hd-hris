import React, {useCallback, useEffect} from 'react';
import useSearch from "@/hooks/utils/useSearch";
import useFilter from "@/hooks/utils/useFilter";
import {usePagination} from "@/hooks/utils/usePagination";
import {useSort} from "@/hooks/utils/useSort";
import {ButtonGroup, cn, Pagination, Select, Selection, SelectItem} from "@nextui-org/react";
import Search from "@/components/util/search";
import Filter from "@/components/util/filter";
import Sort from "@/components/util/sort";
import Typography from "@/components/common/typography/Typography";
import {Tooltip} from "@nextui-org/tooltip";
import {Button} from "@nextui-org/button";
import {LuLayoutGrid, LuLayoutList, LuTable2, LuTrash2} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";
import {
    DisplayType, useDataDisplayControl
} from "@/components/common/data-display/provider/data-display-control-provider";
import {DataDisplayControlProps} from "@/components/common/data-display/types/types";
import CountUp from "react-countup";
import DataMigration from "@/components/util/data-migration";
import {useSearchParams} from "next/navigation";

function DataDisplayControl<T>({
                                   title,
                                   children,
                                   searchProps,
                                   sortProps,
                                   filterProps,
                                   className,
                                   paginationProps,
                                   buttonGroupProps,
                                   rowSelectionProps,
                                   isTable,
                                   isGrid,
                                   isList,
                                   onExport,
                                   onImport,
                                   onDeleteSelected
                               }: DataDisplayControlProps<T>) {

    const searchParams = useSearchParams();
    const rowsSearchParams = Number(searchParams.get('rows') || 5)
    const displaySearchParams = searchParams.get('display') || 'table'
    const {values, selectedKeys, display, setDisplay} = useDataDisplayControl<T>()
    const {searchValue, onSearchChange, itemSearched} = useSearch<T>(values, searchProps?.searchingItemKey || [])
    const {filteredItems, onFilterChange, filter} = useFilter<T>(itemSearched)
    const {paginatedData, onPageChange, totalPages, page, setRows, rows} = usePagination<T>(filteredItems, {
        totalItems: paginationProps?.data_length || 1, rowsPerPage: rowsSearchParams
    })
    const {sortedItems, onSortChange, sortDescriptor} = useSort<T>(paginatedData)


    const displayMethods = [isTable, isGrid, isList].filter(item => item === true).length

    useEffect(() => {
        setDisplay(displaySearchParams as DisplayType)
    }, [displaySearchParams, setDisplay]);

    useEffect(() => {
        if (rowSelectionProps?.onRowChange) {
            rowSelectionProps?.onRowChange(Number(rows))
            // setRows()
        }
    }, [rowSelectionProps, rows]);
    const handleOnSearch = useCallback((value: string) => {
        onSearchChange(value);
        onPageChange(1); // Reset to page 1 when a new search is triggered
    }, [onSearchChange, onPageChange]);

    const handleOnFilterChange = (value: Selection) => {
        onFilterChange(value)
        onPageChange(1)
    }

    const handleOnRowsPerPageChange = (value: Selection) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        const rowPerPage = value !== "all" && value.size > 0 ? Array.from(value)[0] : 5
        // if (rowSelectionProps?.onRowChange) {
        //     rowSelectionProps?.onRowChange(Number(rowPerPage))
        //     // setRows()
        // }
        setRows(Number(rowPerPage))

        if (value !== 'all' && value.size > 0) {
            newSearchParams.set('rows', Array.from(value).join(','));
        } else {
            newSearchParams.delete('rows');
        }

        window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
    }

    const handleOnDisplayChange = (value: DisplayType) => {
        setDisplay(value)
        const newSearchParams = new URLSearchParams(searchParams.toString());

        if (value) {
            newSearchParams.set("display", value)
        } else {
            newSearchParams.delete("display")
        }

        window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
    }

    const handleDeleteSelection = (keys: Selection) => {
        onDeleteSelected(keys)
    }

    return (<div className={cn("flex flex-col h-full w-full px-2", className?.wrapper)}>
        <div className={cn("sticky top-0 z-10 pb-3 flex justify-between items-center", className?.upper)}>
            <div className="flex justify-start gap-3">
                {searchProps &&
                    <Search value={searchValue} onChange={handleOnSearch} {...searchProps} className="flex-1"/>}
                {filterProps && <Filter
                    filterValue={filter}
                    onChange={handleOnFilterChange}
                    {...filterProps!}
                />}
                {sortProps && <Sort
                    onSortChange={onSortChange}
                    initialValue={sortDescriptor}
                    {...sortProps}
                />}
            </div>
            <div className="flex justify-end gap-3">
                <DataMigration onImport={onImport!} onExport={onExport!}/>
            </div>
        </div>
        <div className="flex justify-between pb-3 items-center">
            {title && <Typography className="text-medium font-semibold text-primary/50">
                <CountUp start={0} end={paginationProps?.data_length!} prefix="Total of " suffix={` ${title}`}/>
                {/*{ title ? Total < CountUp start={0} end={values.length}/>}*/}
                {/*{selectedKeys ? (selectedKeys === "all" ? "All items selected" : `${selectedKeys.size} of ${values.length} selected`) : ''}*/}
            </Typography>}
            {paginationProps && <div className="flex mr-0 ml-auto items-center gap-2">
                <Typography className="text-medium font-semibold text-primary/50 w-[125px]">
                    Rows per page
                </Typography>
                <Select
                    aria-label="Rows Per Page"
                    className="w-[75px]"
                    size="sm"
                    radius="md"
                    variant="bordered"
                    color="primary"
                    selectedKeys={new Set([String(rows)])}
                    onSelectionChange={handleOnRowsPerPageChange}
                    {...rowSelectionProps}
                >
                    <SelectItem key={5}>5</SelectItem>
                    <SelectItem key={10}>10</SelectItem>
                    <SelectItem key={15}>15</SelectItem>
                    <SelectItem key={20}>20</SelectItem>
                </Select>
            </div>}
        </div>

        {children(sortedItems, sortDescriptor, onSortChange)}

        {/* Bottom pagination */}
        <div
            className={cn("sticky bottom-0 z-10 py-2 shadow-sm flex justify-between items-center w-full", className?.lower)}>
            <div className={cn("flex justify-start items-center gap-2", className?.lower.selectedKeysClassname)}>
                <Typography className="text-medium font-semibold text-primary/50">
                    {selectedKeys ? (selectedKeys === "all" ? "All items selected" : `${selectedKeys.size} of ${values.length} selected`) : ''}
                </Typography>
                {selectedKeys && (selectedKeys === "all" || selectedKeys.size > 1) && (
                    <Button isIconOnly variant="light" onClick={() => handleDeleteSelection(selectedKeys)}>
                        <LuTrash2 className={cn("text-danger", icon_size_sm)}/>
                    </Button>)}
            </div>
            {/* Pagination centered */}
            {paginationProps && <div className={cn("flex-1 flex justify-center", className?.lower.paginationClassname)}>
                <Pagination
                    showControls
                    total={totalPages}
                    page={page}
                    onChange={onPageChange}
                    {...paginationProps}
                />
            </div>}

            <div className={cn("flex justify-end", className?.lower.buttonClassname)}>
                {
                    displayMethods > 1 && (
                        <ButtonGroup variant="light" color="primary" isIconOnly {...buttonGroupProps}>
                            {isTable && (<Tooltip content="Table">
                                <Button onClick={() => handleOnDisplayChange("table")}
                                        variant={display === "table" ? "flat" : "light"}>
                                    <LuTable2 className={cn("text-slate-700", icon_size_sm)}/>
                                </Button>
                            </Tooltip>)}

                            {isGrid && (<Tooltip content="Grid">
                                <Button onClick={() => handleOnDisplayChange("grid")}
                                        variant={display === "grid" ? "flat" : "light"}>
                                    <LuLayoutGrid className={cn("text-slate-700", icon_size_sm)}/>
                                </Button>
                            </Tooltip>)}

                            {isList && (<Tooltip content="List">
                                <Button onClick={() => handleOnDisplayChange("list")}
                                        variant={display === "list" ? "flat" : "light"}>
                                    <LuLayoutList className={cn("text-slate-700", icon_size_sm)}/>
                                </Button>
                            </Tooltip>)}
                        </ButtonGroup>
                    )
                }

            </div>

        </div>

    </div>)
}

export default DataDisplayControl;

