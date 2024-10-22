"use client"
import React, {useMemo} from 'react';
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import dayjs from "dayjs";
import {Button} from "@nextui-org/button";
import {useLeaveRequest} from "@/services/queries";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import DataDisplay from "@/components/common/data-display/data-display";
import {FilterItems, TableConfigurations} from "@/components/admin/leaves/table-config/approval-tables-configuration";
import BorderCard from "@/components/common/BorderCard";

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

function Page() {
    const {data, isLoading} = useLeaveRequest()

    const allRequests = useMemo(() => {
        if (data) return data.map((item) => {
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
                approvedBy
            }
        })
    }, [data])

    SetNavEndContent((router) => <Button
        {...uniformStyle()}
        onClick={() => router?.push("/leaves/leave-requests/create")}
    >
        File Leave
    </Button>)
    return (<DataDisplay
            defaultDisplay="list"
            data={allRequests || []}
            title="Leave Requests"
            filterProps={{
                filterItems: FilterItems
            }}
            onTableDisplay={{
                config: TableConfigurations, isLoading, layout: "auto"
            }}
            searchProps={{
                searchingItemKey: ["name"]
            }}
            sortProps={{
                sortItems: [{
                    name: "ID", key: "id"
                }]
            }}

            onListDisplay={(data) => {
                return (<BorderCard>{data.name}</BorderCard>)
            }}
        />

    );
}

export default Page;