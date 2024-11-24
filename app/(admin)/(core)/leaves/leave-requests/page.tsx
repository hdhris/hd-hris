"use client"
import React, {useCallback, useMemo, useState} from 'react';
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import dayjs from "dayjs";
import {Button} from "@nextui-org/button";
import {useLeaveRequest, usePaginateQuery} from "@/services/queries";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import DataDisplay from "@/components/common/data-display/data-display";
import {FilterItems, TableConfigurations} from "@/components/admin/leaves/table-config/approval-tables-configuration";
import BorderCard from "@/components/common/BorderCard";
import RequestForm from "@/components/admin/leaves/request-form/form/RequestForm";
import {EmployeeLeaveCredits} from "@/types/leaves/leave-credits-types";
import {LeaveRequest} from "@/types/leaves/LeaveRequestTypes";
import {useEmployeeId} from "@/hooks/employeeIdHook";

interface LeaveRequestPaginate {
    data: LeaveRequest[]
    totalItems: number
}
function Page() {
    // const {data, isLoading} = useLeaveRequest()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)

    // const empID = useEmployeeId()
    // console.log("Emp ID: ", empID)
    const {data, isLoading} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/requests", page, rows, {
        refreshInterval: 3000
    });


    const allRequests = useMemo(() => {
        console.log("Leave Data: ", data?.data)
        if (data) return data.data.map((item) => {
            const created_by = {
                id: item.created_by.id,
                name: item.created_by.name,
                picture: item.created_by.picture,
            }

            return {
                id: item.id,
                employee_id: item.employee_id,
                picture: item.picture,
                email: item.email || "N/A",
                name: item.name,
                leave_type: {
                    id: item.leave_type.id,
                    name: item.leave_type.name,
                    code: item.leave_type.code
                },
                leave_details: {
                    start_date: item.leave_details.start_date, // Format date here
                    end_date: item.leave_details.end_date,     // Format date here
                    total_days: item.leave_details.total_days,
                    comment: item.leave_details.comment,
                    reason: item.leave_details.reason,
                    attachment: item.leave_details.attachment,
                    status: item.leave_details.status,
                    created_at: item.leave_details.created_at,
                    updated_at: item.leave_details.updated_at
                },
                evaluators: item.evaluators,

                // days_of_leave: String(dayjs(item.start_date).diff(item.end_date, 'day').toFixed(2)),
                created_by
            }
        })

        return []
    }, [data])

    const onOpenDrawer = useCallback(() => {
        setIsOpen(true)
    }, [setIsOpen])

    SetNavEndContent(() => {

        return (<>
            <Button {...uniformStyle()} onClick={onOpenDrawer}>
                File A Leave
            </Button>
            <RequestForm onOpen={setIsOpen} isOpen={isOpen}/>
        </>)
    })
    return (<DataDisplay
            isLoading={isLoading}
            defaultDisplay="table"
            data={allRequests || []}
            title="Leave Requests"
            filterProps={{
                filterItems: FilterItems
            }}
            onTableDisplay={{
                config: TableConfigurations, layout: "auto"
            }}
            searchProps={{
                searchingItemKey: ["name"]
            }}
            sortProps={{
                sortItems: [{
                    name: "ID", key: "id"
                }]
            }}
            rowSelectionProps={{
                onRowChange: setRows
            }}
            paginationProps={{
                loop: true, data_length: data?.totalItems!, onChange: setPage
            }}
            onListDisplay={(data) => {
                return (<BorderCard>{data.name}</BorderCard>)
            }}
        />

    );
}

export default Page;