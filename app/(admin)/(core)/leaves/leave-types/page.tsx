import React from 'react';
import RequestForm from "@/components/admin/leaves/request-form/RequestForm";
import RequestCard from "@/components/admin/leaves/request-form/RequestCard";
import LeaveTypesForm from "@/components/admin/leaves/leave-types/LeaveTypesForm";
import GridCard, {LeaveTypeProps} from "@/components/common/cards/GridCard";
import {Card, CardFooter} from "@nextui-org/react";
import {CardBody} from "@nextui-org/card";
import gradient from 'random-gradient'
import {unstable_cache} from "next/cache";
import prisma from "@/prisma/prisma";
import RenderList from "@/components/util/RenderList";

const getLeaveTypes = unstable_cache(async () => {
    return prisma.ref_leave_types.findMany({
        where: {
            deleted_at: null
        }, select: {
            duration_days: true,
            id: true,
            name: true,
            code: true,
            is_active: true,
            is_carry_forward: true
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
            return res.map((item) => ({key: item.id, ...item}));
        }
    );

    return (
        <div className="grid grid-cols-[repeat(5,1fr)] gap-4 h-full">
            <RenderList
                items={data}
                map={(item, key) => {
                    return (
                        <GridCard
                            name={item.name}
                            duration={item.duration_days + " Days"}
                            code={item?.code!}
                            carryForward={item?.is_carry_forward!}
                            isActive={item?.is_active!}
                            key={key}
                        />
                    )
                }}
            />
            {/*<GridCard name={"Muhammad Nizam Datumanong"} duration={"20 Days"} code={"SL"} carryForward={true} isActive={true}/>*/}
            {/*<GridCard name={"Sick Leave"} duration={"20 Days"} code={"SL"} carryForward={true} isActive={true}/>*/}
            {/*<GridCard name={"Sick Leave"} duration={"20 Days"} code={"SL"} carryForward={true} isActive={true}/>*/}
            {/*<GridCard name={"Sick Leave"} duration={"20 Days"} code={"SL"} carryForward={true} isActive={true}/>*/}
            {/*<GridCard name={"Sick Leave"} duration={"20 Days"} code={"SL"} carryForward={true} isActive={true}/>*/}
        </div>
    );
}

export default Page;