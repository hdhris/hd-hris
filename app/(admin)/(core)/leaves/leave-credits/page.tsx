"use client"
import React, {useMemo} from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import DataDisplay from "@/components/common/data-display/data-display";
import {usePaginateQuery} from "@/services/queries";
import {LeaveRequestPaginate} from "@/types/leaves/LeaveTypes";

function Page() {
    // SetNavEndContent(() => <></>);
    const {data, isLoading} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/leave-types", 1, 10, {
        refreshInterval: 3000
    });
    const leaveData = useMemo(() => {
        if (!data?.data) {
            return []
        } else {
            return data.data
        }
    }, [data])
    return (
        <DataDisplay
            // title="Leave Credits"
            data={leaveData}
            defaultDisplay="grid"
            searchProps={{searchingItemKey: ["name"]}}
            onGridDisplay={(data) => {
                return <p>No grid display available</p>
            }}
        />
    );
}

export default Page;