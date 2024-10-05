import React from 'react';
import gradient from 'random-gradient'
import {unstable_cache} from "next/cache";
import prisma from "@/prisma/prisma";
import LeaveTypesCard from "@/components/admin/leaves/leave-types/LeaveTypesCard";
import {ScrollShadow} from "@nextui-org/scroll-shadow";

const getLeaveTypes = unstable_cache(async () => {
    return prisma.ref_leave_types.findMany({
        where: {
            deleted_at: null
        }, select: {
            duration_days: true, id: true, name: true, code: true, is_active: true, is_carry_forward: true
        }
    });
}, ['leaveTypes'], {revalidate: 3, tags: ['leaveTypes']})

async function Page() {
    // const bgGradient = { background: gradient("Sick Leave") }
    const bgGradient = (name: string) => {
        return {
            style: {
                background: gradient(name)
            }
        }
    }

    const data = await getLeaveTypes().then((res) => {
        return res.map((item) => {
            return {
                key: item.id,
                duration_days: item.duration_days ?? 0,
                name: item.name,
                code: item.code || "N/A",
                is_carry_forward: item.is_carry_forward!,
                is_active: item.is_active!,
            }
        });
    });

    return (
            <ScrollShadow className="flex flex-wrap gap-6 justify-center h-full pb-3 overflow-auto">
                <LeaveTypesCard data={data}/>
            </ScrollShadow>
        );
}

export default Page;