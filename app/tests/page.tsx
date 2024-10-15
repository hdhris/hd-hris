"use client"
import React, {useMemo} from 'react';
import TableSearch from "@/components/tabledata/table/table-search";
import useSearch from "@/hooks/table/SearchHook";
import {useLeaveTypes} from "@/services/queries";
import {LeaveTypesItems} from "@/types/leaves/LeaveRequestTypes";
import useFilter from "@/hooks/table/FilterHook";
import {filterLeaveTypes} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import TableFilter from "@/components/tabledata/table/table-filter";
import TableSort from "@/components/tabledata/table/table-sort";
import {useSort} from "@/hooks/table/SortHook";

function Page() {
    const {data, isLoading} = useLeaveTypes()
    const leaveData = useMemo(() => {
        if (!data) return []
        return data
    }, [data])
    const {searchValue, onSearchChange, itemSearched} = useSearch<LeaveTypesItems>(leaveData, ["name"])
    const {filteredItems, onFilterChange, filter} = useFilter<LeaveTypesItems>(itemSearched)
    const {sortedItems, onChange, sortedColumn} = useSort<LeaveTypesItems>(filteredItems, {})
    // useEffect(() => {
    //     console.log("Filtered: ", filteredItems.map(item => item.name))
    // }, [filteredItems])

    const parse = useMemo(() => {
        return (<pre>{JSON.stringify(sortedItems, null, 2)}</pre>)
    }, [sortedItems])
    return (<>
            <div className="flex gap-2 items-center m-5">
                <TableSearch value={searchValue} onChange={onSearchChange}/>
                <TableFilter filterValue={filter} filterItems={filterLeaveTypes} onChange={onFilterChange} />
                <TableSort sortItems={[{
                    name: "Name",
                    key: "name"
                }, {
                    name: "Count",
                    key: "count"
                }]} onSortChange={onChange} initialValue={"name"}/>
            </div>
            {parse}
        </>

    );

}

export default Page;