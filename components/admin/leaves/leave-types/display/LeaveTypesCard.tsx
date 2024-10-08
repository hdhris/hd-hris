"use client";
import React, {useEffect, useState} from 'react';
import GridCard from "@/components/common/cards/GridCard";
import {LeaveTypesItems} from "@/types/leaves/LeaveRequestTypes";
import {useLeaveTypes} from "@/services/queries";
import Loading from "@/components/spinner/Loading";
import Header from "@/components/admin/leaves/leave-types/display/action-control/Header";
import Body from "@/components/admin/leaves/leave-types/display/action-control/Body";
import {useFormTable} from "@/components/providers/FormTableProvider";
import {LeaveTypesKey} from "@/types/leaves/LeaveTypes";
import {useDisclosure} from "@nextui-org/react";
import LeaveTypeUpdate from "@/components/admin/leaves/leave-types/update/LeaveTypeUpdate";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {Button} from "@nextui-org/button";

function LeaveTypesCard() {
    const {data, isLoading} = useLeaveTypes()
    const {formData} = useFormTable<LeaveTypesKey>()
    const [leaveTypes, setLeaveTypes] = useState<LeaveTypesItems[]>([])
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    useEffect(() => {
        if (data && !isLoading) {
            const leaves_types = data.map((item) => {
                return {
                    key: item.key,
                    employee_count: item.employee_count,
                    duration_days: item.duration_days ?? 0,
                    name: item.name,
                    code: item.code || "N/A",
                    is_carry_forward: item.is_carry_forward!,
                    is_active: item.is_active!,
                }
            })
            setLeaveTypes(leaves_types)
        }
    }, [data, isLoading])

    useEffect(() => {
        if (formData?.methods === "Delete") {
            // alert("Delete: " + formData?.data?.key)
            setLeaveTypes((prev) => prev.filter((item) => item.key !== formData?.data?.key))
        } else if (formData?.methods === "Edit") {
            alert("Edit: " + formData?.data?.key)
            onOpen()
        }
    }, [formData, onOpen])

    if (isLoading) return <Loading/>
    return (<>
        <div className="flex justify-end">
            <Button
                radius="sm"
                color="primary"
                size="sm"
            >
                Add Leave Type
            </Button>
        </div>
        <ScrollShadow className="w-full h-full p-5 overflow-auto">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] place-items-center gap-5">
                <GridCard
                    data={leaveTypes?.sort((a, b) => a.name.localeCompare(b.name))}
                    header={({key, name, is_active}) => (<Header id={key} name={name} is_active={is_active}/>)}
                    body={({employee_count, duration_days, code, is_carry_forward}) => (
                        <Body employee_count={employee_count} duration_days={duration_days} code={code}
                              is_carry_forward={is_carry_forward}/>)}/>
            </div>
            <LeaveTypeUpdate isOpen={isOpen} onOpenChange={onOpenChange}/>
        </ScrollShadow>
    </>);
}

export default LeaveTypesCard;
