"use client"
import React from 'react';
import {Badge, Listbox, ListboxItem, ScrollShadow} from "@nextui-org/react";
import {Avatar} from "@nextui-org/avatar";
import BorderCard from "@/components/common/BorderCard";
import Typography from "@/components/common/typography/Typography";
import {Chip} from "@nextui-org/chip";
import {leaveList, leaves} from "@/sampleData/admin/dashboard/LeaveData";

function ActiveLeaves() {
    return (
        <BorderCard heading={
            <>Leave Requests: <Chip size="sm" className="p-0"><Typography className="text-tiny font-semibold">{leaveList.length}</Typography></Chip></>
        } className="flex flex-col col-span-2 overflow-hidden">
            <ScrollShadow hideScrollBar className="h-full flex-1">
                <Listbox
                    items={leaveList}
                    label="Assigned to"
                    variant="flat"
                >
                    {(item) => (
                        <ListboxItem key={item.id} textValue={item.name}>
                            <div className="flex justify-between">
                            <div className="flex gap-2 items-center">
                                <Avatar alt={item.name} className="flex-shrink-0" size="sm" src={item.avatar}/>
                                <div className="flex flex-col">
                                    <span className="text-small">{item.name}</span>
                                    <span className="text-tiny text-default-400">{item.email}</span>
                                </div>
                            </div>
                            <Typography as="span" suppressHydrationWarning className="text-tiny text-default-400 opacity-50 self-end">{item.dateRequested as string}</Typography>
                            </div>
                        </ListboxItem>
                    )}
                </Listbox>
            </ScrollShadow>
        </BorderCard>

    );
}

export default ActiveLeaves;