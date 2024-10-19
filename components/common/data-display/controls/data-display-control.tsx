import React, {useCallback} from 'react';
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
import {LuLayoutGrid, LuLayoutList, LuTable2} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";
import {useDataDisplayControl} from "@/components/common/data-display/provider/data-display-control-provider";
import {DataDisplayControlProps} from "@/components/common/data-display/types/types";
import CountUp from "react-countup";
import DataMigration from "@/components/util/data-migration";
import {useRouter, useSearchParams} from "next/navigation";

function DataDisplayControl<T>({
                                   title,
                                   children,
                                   searchProps,
                                   sortProps,
                                   filterProps,
                                   className,
                                   paginationProps,
                                   buttonGroupProps,
                                   isTable,
                                   isGrid,
                                   isList,
                                   onExport,
                                   onImport
                               }: DataDisplayControlProps<T>) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const {values, selectedKeys, display, setDisplay, setSortDescriptor} = useDataDisplayControl<T>()
    const {searchValue, onSearchChange, itemSearched} = useSearch<T>(values, searchProps.searchingItemKey)
    const {filteredItems, onFilterChange, filter} = useFilter<T>(itemSearched)
    const {paginatedData, onPageChange, totalPages, page, setRows, rows} = usePagination<T>(filteredItems)
    const {sortedItems, onSortChange, sortDescriptor} = useSort<T>(paginatedData)


    const handleOnSearch = useCallback((value: string) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        if (value.trim() === '') {
            // If the input is empty, delete the query parameter
            newSearchParams.delete('query'); // Replace 'query' with your actual query parameter name
        } else {
            // Update the query parameter with the new value
            newSearchParams.set('query', value);
        }
        newSearchParams.set('query', value);
        // Update the router with new search parameters
        router.push(`?${newSearchParams.toString()}`); // Navigate to the new URL
        console.log("URL: ", newSearchParams.toString())
        onSearchChange(value);
        onPageChange(1); // Reset to page 1 when a new search is triggered
    }, [searchParams, router, onSearchChange, onPageChange]);

    const handleOnFilterChange = (value: Selection) => {
        onFilterChange(value)
        onPageChange(1)
    }

    const handleOnRowsPerPageChange = (value: Selection) => {
        const rowPerPage = value !== "all" && value.size > 0 ? Array.from(value)[0] : 5
        setRows(Number(rowPerPage))
    }

    return (<div className={cn("flex flex-col h-full w-full px-2", className?.wrapper)}>
        <div className={cn("sticky top-0 z-10 pb-3 flex justify-between items-center", className?.upper)}>
            <div className="flex justify-start gap-3">
                <Search value={searchValue} onChange={handleOnSearch} {...searchProps} className="flex-1"/>
                <Filter
                    filterValue={filter}
                    onChange={handleOnFilterChange}
                    {...filterProps!}
                />
                <Sort
                    onSortChange={onSortChange}
                    {...sortProps}
                />
            </div>
            <div className="flex justify-end gap-3">
                <DataMigration onImport={onImport!} onExport={onExport!}/>
            </div>
        </div>
        <div className="flex justify-between pb-3 items-center">
            <Typography className="text-medium font-semibold text-primary/50">
                <CountUp start={0} end={values.length} prefix="Total of " suffix={` ${title}`}/>
                {/*{ title ? Total < CountUp start={0} end={values.length}/>}*/}
                {/*{selectedKeys ? (selectedKeys === "all" ? "All items selected" : `${selectedKeys.size} of ${values.length} selected`) : ''}*/}
            </Typography>
            <div className="flex mr-0 ml-auto items-center gap-2">
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
                >
                    <SelectItem key={5}>5</SelectItem>
                    <SelectItem key={10}>10</SelectItem>
                    <SelectItem key={15}>15</SelectItem>
                    <SelectItem key={20}>20</SelectItem>
                </Select>
            </div>
        </div>

        {children(sortedItems, sortDescriptor, setSortDescriptor)}

        {/* Bottom pagination */}
        <div
            className={cn("sticky bottom-0 z-10 py-2 shadow-sm flex justify-between items-center w-full", className?.lower)}>
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
                    {isTable && (<Tooltip content="Table">
                        <Button onClick={() => setDisplay("table")}
                                variant={display === "table" ? "flat" : "light"}>
                            <LuTable2 className={cn("text-slate-700", icon_size_sm)}/>
                        </Button>
                    </Tooltip>)}

                    {isGrid && (<Tooltip content="Grid">
                        <Button onClick={() => setDisplay("grid")} variant={display === "grid" ? "flat" : "light"}>
                            <LuLayoutGrid className={cn("text-slate-700", icon_size_sm)}/>
                        </Button>
                    </Tooltip>)}

                    {isList && (<Tooltip content="List">
                        <Button onClick={() => setDisplay("list")} variant={display === "list" ? "flat" : "light"}>
                            <LuLayoutList className={cn("text-slate-700", icon_size_sm)}/>
                        </Button>
                    </Tooltip>)}
                </ButtonGroup>
            </div>

        </div>

    </div>)
}

export default DataDisplayControl;

