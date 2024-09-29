import React from 'react';
import TableData from "@/components/tabledata/TableData";
import {FilterItems, TableConfigurations} from "@/components/admin/leaves/approval-tables-configuration";
import {LeaveRequestTypes} from "@/types/leaves/LeaveRequestTypes";
import prisma from "@/prisma/prisma";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import dayjs from "dayjs";
import {unstable_cache} from 'next/cache'
import {Button} from "@nextui-org/button";
import Link from "next/link";

const getRequests = unstable_cache(async () => {
    return prisma.trans_leaves.findMany({
        where: {
            end_date: {
                gte: new Date()
            }
        }, include: {
            trans_employees_leaves: {
                select: {
                    email: true,
                    prefix: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    suffix: true,
                    extension: true,
                    picture: true
                }
            }, trans_employees_leaves_approvedBy: {
                select: {
                    email: true,
                    prefix: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    suffix: true,
                    extension: true,
                    picture: true
                }
            }, ref_leave_types: true
        }
    });
}, ['requests'], {revalidate: 3, tags: ['requests']})

async function Page() {
    const allRequests = await getRequests().then((res) => res.map((item) => {
        const approvedBy = {
            name: getEmpFullName(item.trans_employees_leaves_approvedBy),
            picture: item.trans_employees_leaves_approvedBy?.picture
        }
        return {
            id: item.id,
            picture: item.trans_employees_leaves?.picture,
            email: item.trans_employees_leaves?.email || "N/A",
            name: getEmpFullName(item.trans_employees_leaves!),
            leave_type: item.ref_leave_types?.name!,
            start_date: dayjs(item.start_date).format('YYYY-MM-DD'), // Format date here
            end_date: dayjs(item.end_date).format('YYYY-MM-DD'),     // Format date here
            total_days: dayjs(item.end_date).diff(item.start_date, 'day'),
            status: item.status as "Pending" | "Approved" | "Rejected",
            approvedBy
        }
    }) as LeaveRequestTypes[]);
    return (<TableData
            config={TableConfigurations}
            items={allRequests}
            isStriped
            isHeaderSticky
            counterName="Leave Requests"
            searchingItemKey={["name"]}
            removeWrapper
            aria-label="Leave Approvals"
            filterItems={FilterItems}
            endContent={<Button color="primary" radius="sm" size="sm" as={Link} href="/leaves/leave-requests/create">Add Leave Application</Button>}
        />


    );
}

export default Page;