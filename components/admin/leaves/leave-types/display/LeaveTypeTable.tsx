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
import Typography from "@/components/common/typography/Typography";
import {Card} from "@nextui-org/react";
import {getColor, gradientColor, textColor} from "@/helper/background-color-generator/generator";
import {isObjectEmpty} from "@/helper/objects/isObjectEmpty";
import {Chip} from "@nextui-org/chip";
import {CardBody, CardHeader} from "@nextui-org/card";
import {Bell, Calendar, Clock, DollarSign, FileCheck, RefreshCcw, Users} from "lucide-react";
import {capitalize} from "@nextui-org/shared-utils";


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
    return (<Card {...gradientColor(props.code, props.name, 0.2)} className="w-[40%] overflow-hidden">
        {!isObjectEmpty(props) ? (<>
                <CardHeader className="h-24 border-b bg-white bg-opacity-50 backdrop-blur-sm w-full">
                    <div className="flex items-center justify-between w-full">
                        <Typography {...textColor(props.code)} className="text-2xl font-bold">{props.name}</Typography>
                        <Chip style={{
                            background: getColor(props.code, 0.2),
                            borderColor: getColor(props.code, 0.5),
                            color: getColor(props.code)
                        }} variant="bordered" classNames={{
                            content: "font-bold",
                        }}>
                            {props.code}
                        </Chip>
                    </div>
                </CardHeader>
                <CardBody className="grid gap-4 p-6">
                    <div className="grid gap-2">
                        <div className="flex items-center space-x-2 text-pink-700">
                            <Calendar className="h-5 w-5"/>
                            <span className="font-semibold">Accrual Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex flex-col gap-2">Frequency: <Typography
                                className="font-semibold">{capitalize(props.accrual_frequency)}</Typography></div>
                            <div className="flex flex-col gap-2">Rate: <Typography
                                className="font-semibold">{props.accrual_rate} days</Typography></div>
                            <div className="flex flex-col gap-2">Max Accrual: <Typography
                                className="font-semibold">{props.max_accrual} days</Typography></div>
                            <div className="flex flex-col gap-2">Carry Over: <Typography
                                className="font-semibold">{props.carry_over ? "Yes" : "No"}</Typography></div>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center space-x-2 text-pink-700">
                            <Clock className="h-5 w-5"/>
                            <span className="font-semibold">Duration</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex flex-col gap-2">Minimum: <Typography
                                className="font-semibold">{props.min_duration} days</Typography></div>
                            <div className="flex flex-col gap-2">Maximum: <Typography
                                className="font-semibold">{props.max_duration} days</Typography></div>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center space-x-2 text-pink-700">
                            <Users className="h-5 w-5"/>
                            <span className="font-semibold">Eligibility</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-sm flex flex-col gap-2">Applicable to: <Typography
                                className="font-semibold">{props.applicable_to_employee_types} Employees</Typography>
                            </div>
                            <div className="text-sm flex flex-col gap-2">Current Usage: <Typography
                                className="font-semibold">{props.employee_count} Employee/s</Typography></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                            <FileCheck className="h-5 w-5 text-green-600"/>
                            <span><Typography
                                className="font-semibold">{props.attachment_required ? "Attachment required" : "No attachment required"}</Typography></span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Bell className="h-5 w-5 text-yellow-600"/>
                            <span><Typography
                                className="font-semibold">{props.notice_required} days notice required</Typography></span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-blue-600"/>
                            <span><Typography
                                className="font-semibold">{props.paid_leave ? "Paid Leave" : "Unpaid Leave"}</Typography></span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RefreshCcw className="h-5 w-5 text-purple-600"/>
                            <span>Last updated: <Typography
                                className="font-semibold">{new Date(props.updated_at).toLocaleDateString()}</Typography></span>
                        </div>
                    </div>
                </CardBody>
            </>
            // <CardBody className="overflow-hidden">
            //     {/*{body(item)}*/}
            // </CardBody>
        ) : (<div className="grid place-items-center h-full"><Typography className="text-slate-700/50 font-semibold">No
            Row Selected</Typography></div>)}
    </Card>)
}