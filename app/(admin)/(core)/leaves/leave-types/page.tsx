import React from 'react';
import RequestForm from "@/components/admin/leaves/request-form/RequestForm";
import RequestCard from "@/components/admin/leaves/request-form/RequestCard";
import LeaveTypesForm from "@/components/admin/leaves/leave-types/LeaveTypesForm";
import GridCard from "@/components/common/cards/GridCard";
import {Card, CardFooter} from "@nextui-org/react";
import {CardBody} from "@nextui-org/card";
import gradient from 'random-gradient'
function Page() {
    // const bgGradient = { background: gradient("Sick Leave") }
    const bgGradient = (name: string) => {
        return {
            style: {
                background: gradient(name)
            }
        }
    }
    // <div {...bgGradient("2")} className="rounded-full size-44">
    //
    // </div>
    return (
        <div className="grid grid-cols-[repeat(5,1fr)] gap-4 h-full">
            <GridCard name={"Muhammad Nizam Datumanong"} duration={"20 Days"} code={"SL"} carryForward={true} isActive={true}/>
            <GridCard name={"Sick Leave"} duration={"20 Days"} code={"SL"} carryForward={true} isActive={true}/>
            <GridCard name={"Sick Leave"} duration={"20 Days"} code={"SL"} carryForward={true} isActive={true}/>
            <GridCard name={"Sick Leave"} duration={"20 Days"} code={"SL"} carryForward={true} isActive={true}/>
            <GridCard name={"Sick Leave"} duration={"20 Days"} code={"SL"} carryForward={true} isActive={true}/>
        </div>
    );
}

export default Page;