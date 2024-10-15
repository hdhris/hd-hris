"use client"
import React, {useEffect, useMemo} from 'react';
import TableSearch from "@/components/tabledata/table/table-search";
import useSearch from "@/hooks/table/SearchHook";
import {useQuery} from "@/services/queries";
import useFilter from "@/hooks/table/FilterHook";
import {
    filterLeaveTypes, LeaveTypeTableConfiguration
} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import TableFilter from "@/components/tabledata/table/table-filter";
import TableSort from "@/components/tabledata/table/table-sort";
import {useSort} from "@/hooks/table/SortHook";
import {LeaveType} from "@/types/leaves/LeaveTypes";
import TableData from "@/components/tabledata/TableData";
import {Pagination} from "@nextui-org/react";
import {usePagination} from "@/hooks/table/usePagination";
import {Selection} from "@nextui-org/react";
import Loading from "@/components/spinner/Loading";
import dayjs from "dayjs";

function Page() {
    const {data, isLoading} = useQuery<LeaveType[]>("/api/admin/leaves/leave-types", 3000);
    const leaveData = useMemo(() => {
        if (!data) return []
        return data
    }, [data])
    const {searchValue, onSearchChange, itemSearched} = useSearch<LeaveType>(leaveData, ["name"])
    const {filteredItems, onFilterChange, filter} = useFilter<LeaveType>(itemSearched)
    const {sortedItems, onChange} = useSort<LeaveType>(filteredItems)
    const {page, paginatedData, onPageChange, totalPages} =  usePagination(sortedItems)



    const handleOnSearch = (value: string) => {
        onSearchChange(value)
        onPageChange(1)
    }

    const handleOnFilterChange = (value: Selection) => {
        onFilterChange(value)
        onPageChange(1)
    }

    const render = useMemo(() => {
        if(isLoading) return <Loading/>
        return (
            <pre>{JSON.stringify(paginatedData.map(item => ({name: item.name, created_at: dayjs(item.created_at).format("DD-MM-YYYY, hh:mm A")})), null, 2)}</pre>
        )
    }, [isLoading, paginatedData])
    return (<>
            <div className="flex gap-2 items-center m-5">
                <TableSearch value={searchValue} onChange={handleOnSearch}/>
                <TableFilter filterValue={filter} filterItems={filterLeaveTypes} onChange={handleOnFilterChange}/>
                <TableSort sortItems={[{
                    name: "Name", key: "name"
                }, {
                    name: "Created At", key: "created_at"
                }]} onSortChange={onChange}/>
            </div>
            {render}
            <Pagination
                showControls
                total={totalPages}
                page={page}
                onChange={onPageChange}
            />
        </>

    );

}

export default Page;