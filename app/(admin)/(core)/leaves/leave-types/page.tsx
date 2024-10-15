import React from 'react';
import LeaveTypesProvider from "@/components/admin/leaves/leave-types/provider/LeaveTypesProvider";
import LeaveTypes from "@/components/admin/leaves/leave-types/display/table/LeaveTypes";

// const getLeaveTypes = unstable_cache(async () => {
//     return prisma.ref_leave_types.findMany({
//         where: {
//             deleted_at: null
//         }, select: {
//             duration_days: true, id: true, name: true, code: true, is_active: true, is_carry_forward: true
//         }
//     });
// }, ['leaveTypes'], {revalidate: 3, tags: ['leaveTypes']})

async function Page() {
    // const data = await getLeaveTypes().then((res) => {
    //     return res.map((item) => {
    //         return {
    //             key: item.id,
    //             duration_days: item.duration_days ?? 0,
    //             name: item.name,
    //             code: item.code || "N/A",
    //             is_carry_forward: item.is_carry_forward!,
    //             is_active: item.is_active!,
    //         }
    //     });
    // });

    return (<LeaveTypesProvider>

            <LeaveTypes/>

        </LeaveTypesProvider>

    );

}

export default Page;