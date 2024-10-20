"use client"
import React, {Key, useMemo, useState} from 'react';
import {
    filterLeaveTypes, LeaveTypeTableConfiguration
} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import {usePaginateQuery} from "@/services/queries";
import {LeaveRequestPaginate, LeaveType} from "@/types/leaves/LeaveTypes";
import DataDisplay from "@/components/common/data-display/data-display";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import LeaveTypeForm from "@/components/admin/leaves/leave-types/form/LeaveTypeForm";
import BorderCard from "@/components/common/BorderCard";
import Typography from "@/components/common/typography/Typography";
import {cn, Tab, Tabs} from "@nextui-org/react";
import {bgColor, textColor} from "@/helper/background-color-generator/generator";
import {isObjectEmpty} from "@/helper/objects/isObjectEmpty";
import {Chip} from "@nextui-org/chip";


function LeaveTypeTable() {
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)
    const [leaveType, setLeaveType] = useState<LeaveType>()
    const {data, isLoading} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/leave-types", page, rows);
    const leaveData = useMemo(() => {
        if (!data?.data) {
            return []
        } else {
            return data.data
        }
    }, [data])

    SetNavEndContent(() => <LeaveTypeForm/>)

    const handleRowKey = (key: Key) => {
        const data = leaveData.find((item) => item.id === Number(key))
        setLeaveType(data!)
    }
    return (<section className='w-full h-full flex gap-4'>
        <DataDisplay
            title="Leave Types"
            data={leaveData}
            filterProps={{
                filterItems: filterLeaveTypes
            }}
            sortProps={{
                sortItems: [{
                    key: "id", name: "ID"
                }, {key: "name", name: "Name"}, {key: "created_at", name: "Created At"}]

            }}
            searchProps={{
                searchingItemKey: ["name"]
            }}
            rowSelectionProps={{
                onRowChange: setRows
            }}
            paginationProps={{
                loop: true, data_length: data?.totalItems!, onChange: setPage
            }}
            onTableDisplay={{
                config: LeaveTypeTableConfiguration, isLoading, onRowAction: handleRowKey
            }}
            // onGridDisplay={(data) => {
            //     return (<pre>{JSON.stringify(data, null, 2)}</pre>)
            // }}

            // onListDisplay={(data) => {
            //     return (<Card className="w-full">
            //             <CardBody>{data.max_duration}</CardBody>
            //         </Card>
            //
            //     )
            // }}

            onExport={{
                drawerProps: {
                    title: "Export",
                }
            }}
            onImport={{
                drawerProps: {
                    title: "Import",
                }
            }}
        />

        <LeaveTypesDetails {...leaveType!}/>
    </section>);
}

export default LeaveTypeTable;


const LeaveTypesDetails = ({...props}: LeaveType) => {
    return (<BorderCard className="w-1/3 p-0">
        {!isObjectEmpty(props) ? (<>
                <div {...bgColor(props.code, 0.2)}
                     className={cn("relative flex w-full h-24 rounded-b-sm rounded-r-sm shadow-[inset_-1px_-121px_75px_-52px_rgba(255,255,255,0.49)]")}> {/* shadow-[inset_-1px_-121px_75px_-52px_rgba(0,0,0,0.49)] */}
                    {/* Name positioned bottom-left */}
                    {/*<div className="absolute top-2 right-0 pr-2">*/}
                    {/*    <ActionControlDropdown*/}
                    {/*        className="text-default-200"*/}
                    {/*        onDelete={() => {}}*/}
                    {/*        onEdit={() => {}}*/}
                    {/*    />*/}
                    {/*</div>*/}

                    <div className="flex items-end p-2 pl-4 pb-4 gap-4 w-full h-full">
                        {/*<Pulse color={props.is_active ? "success" : "danger"}/>*/}
                        <Typography
                            {...textColor(props.code)}
                            className={cn("w-fit text-2xl font-bold break-words overflow-hidden text-pretty")}>
                            {props.name}
                        </Typography>
                        <Chip variant="flat" {...bgColor(props.code, 0.75)} className="ml-auto mr-0">
                            <Typography
                                {...textColor(props.code)}
                                className="font-semibold">
                                {props.code}
                            </Typography>
                        </Chip>
                        {/*<div className="ml-auto mr-0">*/}
                        {/*    <AvatarGroup isBordered color="primary" size="sm" max={3}>*/}
                        {/*        <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d"/>*/}
                        {/*        <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d"/>*/}
                        {/*        <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d"/>*/}
                        {/*        <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026302d"/>*/}
                        {/*        <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026702d"/>*/}
                        {/*        <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026708c"/>*/}
                        {/*    </AvatarGroup>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <Tabs
                    className="px-3 mt-3"
                    aria-label="Options"
                    color="primary"
                    variant="underlined"
                    classNames={{
                        tabList: "gap-6 w-full relative rounded-none p-0",
                        cursor: "w-full text-primary-500",
                        tab: "max-w-fit px-0",
                        tabContent: "group-data-[selected=true]:text-primary text-medium font-semibold h-6",
                        panel: "px-3"
                    }}
                >
                    <Tab
                        title="Details"
                    >
                        <Typography className="font-semibold">Details</Typography>
                    </Tab>
                    <Tab
                        title="History"
                    >
                        <Typography className="font-semibold">History</Typography>
                    </Tab>
                </Tabs>
            </>
            // <CardBody className="overflow-hidden">
            //     {/*{body(item)}*/}
            // </CardBody>
        ) : (<div className="grid place-items-center h-full"><Typography className="text-slate-700/50 font-semibold">No
            Row Selected</Typography></div>)}
    </BorderCard>)
}