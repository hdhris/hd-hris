"use client"
import React, {useMemo} from 'react';
import LeaveTypesForm from "@/components/admin/leaves/leave-types/create/LeaveTypesForm";
import {useLeaveTypes} from "@/services/queries";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import LeaveTypesCard from "@/components/admin/leaves/leave-types/display/LeaveTypesCard";
import Loading from "@/components/spinner/Loading";

function LeaveTypes() {
    const {data, isLoading} = useLeaveTypes()
    const leave_types = useMemo(() => {
        if (data) {
            return data.map((item) => {
                return {
                    key: item.key,
                    duration_days: item.duration_days ?? 0,
                    name: item.name,
                    code: item.code || "N/A",
                    is_carry_forward: item.is_carry_forward!,
                    is_active: item.is_active!,
                }
            })
        }

        return []
    }, [data])
    return (
        <div className="grid grid-cols-[auto_1fr] gap-4 h-full">
            <LeaveTypesForm/>
            {isLoading ? <Loading/> :
                <ScrollShadow className="flex flex-wrap gap-6 justify-center h-full pb-3 overflow-auto p-2">
                    <LeaveTypesCard data={leave_types}/>
                </ScrollShadow>}

        </div>);
}

export default LeaveTypes;