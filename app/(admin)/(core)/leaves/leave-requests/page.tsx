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

// const getRequests = unstable_cache(async () => {
//     return prisma.trans_leaves.findMany({
//         where: {
//             end_date: {
//                 gte: new Date()
//             }
//         },
//         include: {
//             trans_employees_leaves: {
//                 select: {
//                     email: true,
//                     prefix: true,
//                     first_name: true,
//                     last_name: true,
//                     middle_name: true,
//                     suffix: true,
//                     extension: true,
//                     picture: true
//                 }
//             },
//             trans_employees_leaves_approvedBy: {
//                 select: {
//                     email: true,
//                     prefix: true,
//                     first_name: true,
//                     last_name: true,
//                     middle_name: true,
//                     suffix: true,
//                     extension: true,
//                     picture: true
//                 }
//             },
//             ref_leave_types: true
//         }
//     });
// }, ['leave-requests'], { revalidate: 1, tags: ['leave-requests'] }); // Disable background revalidation
//

interface LeaveRequestPaginate {
    data: LeaveRequest[]
    totalItems: number
}
function Page() {
    // const {data, isLoading} = useLeaveRequest()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)

    const {data, isLoading} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/requests", page, rows, {
        refreshInterval: 3000
    });
    const allRequests = useMemo(() => {
        console.log("Leave Data: ", data?.data)
        if (data) return data.data.map((item) => {
            const approvedBy = {
                name: getEmpFullName(item.trans_employees_leaves_approvedBy),
                picture: item.trans_employees_leaves_approvedBy?.picture
            }

            return {
                id: item.id,
                picture: item.trans_employees_leaves?.picture,
                email: item.trans_employees_leaves?.email || "N/A",
                name: getEmpFullName(item.trans_employees_leaves),
                leave_type: item?.ref_leave_types?.name!,
                start_date: dayjs(item.start_date).format('YYYY-MM-DD'), // Format date here
                end_date: dayjs(item.end_date).format('YYYY-MM-DD'),     // Format date here
                total_days: dayjs(item.end_date).diff(item.start_date, 'day'),
                status: item.status as "Pending" | "Approved" | "Rejected",
                days_of_leave: String(dayjs(item.start_date).diff(item.end_date, 'day').toFixed(2)),
                approvedBy
            }
        })
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