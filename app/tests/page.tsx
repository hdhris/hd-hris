"use client"
import { useQuery } from "@/services/queries";
import {LeaveType} from "@/types/leaves/LeaveTypes";
import {useMemo} from "react";
import useSearch from "@/hooks/utils/useSearch";
import useFilter from "@/hooks/utils/useFilter";
import {useSort} from "@/hooks/utils/useSort";
import {usePagination} from "@/hooks/utils/usePagination";
import TableSearch from "@/components/util/search";
import TableFilter from "@/components/util/filter";
import Sort from "@/components/util/sort";
import {Pagination} from "@nextui-org/react";
import {
    filterLeaveTypes,
    LeaveTypeTableConfiguration
} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import Loading from "@/components/spinner/Loading";
import dayjs from "dayjs";
import {Selection} from "@nextui-org/react";
import DataTable from "@/components/common/data-display/data-table";

function Page() {
    const {data, isLoading} = useQuery<LeaveType[]>("/api/admin/leaves/leave-types");
    const leaveData = useMemo(() => {
        if (!data) return []
        return data
    }, [data])
    const {searchValue, onSearchChange, itemSearched} = useSearch<LeaveType>(leaveData, ["name"])
    const {filteredItems, onFilterChange, filter} = useFilter<LeaveType>(itemSearched)
    const {sortedItems, onSortChange} = useSort<LeaveType>(filteredItems)
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
            {/*<div className="flex gap-2 items-center m-5">*/}
            {/*    <TableSearch value={searchValue} onChange={handleOnSearch} searchingItemKey={["name"]}/>*/}
            {/*    <TableFilter filterValue={filter} filterItems={filterLeaveTypes} onChange={handleOnFilterChange}/>*/}
            {/*    <Sort sortItems={[{*/}
            {/*        name: "Name", key: "name"*/}
            {/*    }, {*/}
            {/*        name: "Created At", key: "created_at"*/}
            {/*    }]} onSortChange={onSortChange}/>*/}
            {/*</div>*/}
            <div className="flex gap-x-3" data-hs-pin-input="">
                <input type="text"
                       className="block w-[38px] text-center border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                       data-hs-pin-input-item="" autoFocus/>
                <input type="text"
                       className="block w-[38px] text-center border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                       data-hs-pin-input-item=""/>
                <input type="text"
                       className="block w-[38px] text-center border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                       data-hs-pin-input-item=""/>
                <input type="text"
                       className="block w-[38px] text-center border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                       data-hs-pin-input-item=""/>
            </div>
            {/*<DataTable*/}
            {/*    data={paginatedData}*/}
            {/*    config={LeaveTypeTableConfiguration}*/}
            {/*/>*/}
            {/*<Pagination*/}
            {/*    showControls*/}
            {/*    total={totalPages}*/}
            {/*    page={page}*/}
            {/*    onChange={onPageChange}*/}
            {/*/>*/}
        </>

    );

}

export default Page