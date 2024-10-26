"use client"
import React, {Key, useCallback, useEffect, useMemo, useState} from 'react';
import {
    filterLeaveTypes, LeaveTypeTableConfiguration
} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import {usePaginateQuery} from "@/services/queries";
import {LeaveRequestPaginate, LeaveType} from "@/types/leaves/LeaveTypes";
import DataDisplay from "@/components/common/data-display/data-display";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import LeaveTypeForm from "@/components/admin/leaves/leave-types/form/LeaveTypeForm";
import Typography from "@/components/common/typography/Typography";
import {Avatar, AvatarGroup, Card, cn, Selection, Tooltip} from "@nextui-org/react";
import {bgColor, getColor, gradientColor, textColor} from "@/helper/background-color-generator/generator";
import {isObjectEmpty} from "@/helper/objects/isObjectEmpty";
import {Chip} from "@nextui-org/chip";
import {CardBody, CardHeader} from "@nextui-org/card";
import {Bell, Calendar, Clock, DollarSign, FileCheck, RefreshCcw, Users} from "lucide-react";
import {capitalize} from "@nextui-org/shared-utils";
import {LuPencil, LuTrash2} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {isEqual} from "lodash";
import showDialog from "@/lib/utils/confirmDialog";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";


function LeaveTypeTable() {
    const {toast} = useToast()
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)
    const [leaveType, setLeaveType] = useState<LeaveType>()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const {data, isLoading} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/leave-types", page, rows, {
        refreshInterval: 3000
    });
    const leaveData = useMemo(() => {
        if (!data?.data) {
            return []
        } else {
            return data.data
        }
    }, [data])

    const onOpenDrawer = useCallback(() => {
        setIsOpen(true)
    }, [setIsOpen])

    SetNavEndContent(() => {

        return (<>
            <Button {...uniformStyle()} onClick={onOpenDrawer}>
                Add Leave Type
            </Button>
            <LeaveTypeForm onOpen={setIsOpen} isOpen={isOpen}/>
        </>)
    })

    const handleRowKey = (key: Key) => {
        const data = leaveData.find((item) => item.id === Number(key))
        setLeaveType(data!)
    }

    useEffect(() => {
        const id = leaveType?.id
        if (!isEqual(leaveData, leaveType)) {
            setLeaveType(leaveData.find((item) => item.id === id))
        }
    }, [leaveData, leaveType]);

    const handleLeaveTypeDeleteMultiple = async (keys: Selection) => {
        const deleteKeys = keys === "all" ? leaveData.map((item) => item.id) // Collect all IDs
            : Array.from(keys).map(key => Number(key)); // Collect selected IDs and convert to numbers


        // Filter leaveData to find names of the deleted items
        const deletedNames = leaveData
            .filter(item => deleteKeys.includes(item.id)) // Use includes to check for matches
            .map(item => item.name) // Map to get the names
            .join(", "); // Join names into a string


        const res = await showDialog({
            title: "Delete Leave Type", message: (<Typography>Are you sure you want to delete this
                <Typography as="span"
                            className="font-semibold"> {deletedNames}</Typography>?
            </Typography>)
        })

        if (res === "yes") {
            const res = await axiosInstance.post('/api/admin/leaves/leave-types/delete', deleteKeys)
            if (res.status !== 200) {
                toast({
                    title: "Error", description: res.data.message, variant: "danger",
                })
            }


        }
        if (res === "no") {
            return;
        }

    }


    return (<section className='w-full h-full flex gap-4'>
        <DataDisplay
            title="Leave Types"
            data={leaveData}
            isLoading={isLoading}
            filterProps={{
                filterItems: filterLeaveTypes
            }}
            sortProps={{
                sortItems: [{
                    key: "id", name: "ID"
                }, {key: "name", name: "Name"}, {key: "created_at", name: "Created At"}]

            }}
            onDeleteSelected={async (keys) => {
                await handleLeaveTypeDeleteMultiple(keys)
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
                config: LeaveTypeTableConfiguration,
                onRowAction: handleRowKey,
                selectionMode: "multiple",
                layout: "auto"
            }}


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
            defaultDisplay="table"/>

        <LeaveTypesDetails {...leaveType!}/>
    </section>);
}

export default LeaveTypeTable;


const LeaveTypesDetails = ({...props}: LeaveType) => {
    const {toast} = useToast()
    const curr_emp = props.current_employees
    const [editOpen, setEditOpen] = useState<boolean>(false)
    const [data, setData] = useState<LeaveType>()
    const handleEmployeePicture = (key: Key) => {
        alert(key)
    }

    const handleLeaveTypeEdit = (value: boolean) => {
        setEditOpen(value)
        setData(props!)
    }

    const handleLeaveTypeDelete = async (key: Key) => {
        const hasEmployees = props.current_employees.length

        const leaveTypeName = props.name
        if (hasEmployees > 0) {
            alert("Cannot delete leave type with employees")
        }

        const res = await showDialog({
            title: "Delete Leave Type", message: (<Typography>Are you sure you want to delete this
                <Typography as="span" className="font-semibold"> {leaveTypeName}</Typography>?
            </Typography>)
        })

        if (res === "yes") {
            const res = await axiosInstance.post('/api/admin/leaves/leave-types/delete', [key])
            if (res.status !== 200) {
                toast({
                    title: "Error", description: res.data.message, variant: "danger",
                })
            }


        }
        if (res === "no") {
            return;
        }

    }

    return (<>
        <Card {...gradientColor(props.code, props.name, 0.2)} className="w-[40%] overflow-hidden">
            {!isObjectEmpty(props) ? (<>
                    <CardHeader
                        className="relative flex flex-col gap-2 h-32 border-b bg-white bg-opacity-50 backdrop-blur-sm w-full">
                        <div className="flex items-center justify-between w-full">
                            <Typography {...textColor(props.code)}
                                        className="text-2xl font-bold">{props.name}</Typography>
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
                        <div className="absolute top-12 left-3 right-3 text-pretty break-words h-24">
                            <Typography className="text-sm text-justify indent-5 h-[4rem]">
                                {props.description}
                            </Typography>
                            <Avatar {...bgColor(props.code, 0.75)}
                                    className="float-left mr-3 [clip-path:circle(50%)] [shape-outside:circle(50%)]"
                                    alt={"system icon"}
                                    src="../assets/system.png" size="md"/>
                        </div>
                    </CardHeader>
                    <CardBody className="relative grid gap-4 p-6">
                        <div className="absolute top-3 right-3 flex gap-2">
                            <Button isIconOnly variant="light" onClick={() => handleLeaveTypeEdit(!editOpen)}>
                                <LuPencil className={cn(icon_size_sm)}/>
                            </Button>
                            <Button isIconOnly variant="light" onClick={() => handleLeaveTypeDelete(props.id)}>
                                <LuTrash2 className={cn("text-danger", icon_size_sm)}/>
                            </Button>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center space-x-2 text-pink-700">
                                <Calendar className="h-5 w-5"/>
                                <span className="font-semibold">Accrual Details</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex flex-col gap-2">Frequency: <Typography
                                    className="font-semibold">{capitalize(props.accrual_frequency)}</Typography>
                                </div>
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
                                <div className="text-sm flex flex-col gap-2">Current Usage:
                                    {curr_emp.length === 0 ? (
                                        <Typography className="font-semibold">No Employees</Typography>) : (
                                        <AvatarGroup isBordered color="primary" max={3} classNames={{
                                            count: "!size-6"
                                        }} renderCount={(count) => {
                                            return (<div onClick={() => alert("more")}
                                                         className="flex relative justify-center items-center box-border overflow-hidden align-middle z-0 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 w-10 h-10 text-tiny bg-primary text-primary-foreground rounded-full ring-2 ring-offset-2 ring-offset-background dark:ring-offset-background-dark -ms-2 data-[hover=true]:-translate-x-3 rtl:data-[hover=true]:translate-x-3 transition-transform data-[focus-visible=true]:-translate-x-3 rtl:data-[focus-visible=true]:translate-x-3 ring-primary !size-6 outline">+{count}</div>)
                                        }}>
                                            {curr_emp.map(item => (<Tooltip key={item.id} content={item.name}>
                                                <Avatar onClick={() => handleEmployeePicture(item.id)}
                                                        classNames={{
                                                            base: "!size-6"
                                                        }} alt={item.name} key={item.id} src={item.picture}/>
                                            </Tooltip>))}
                                            {/*<Tooltip content={item.name}>*/}
                                            {/*    <Avatar classNames={{*/}
                                            {/*        base: "!size-6"*/}
                                            {/*    }} alt={item.name} key={key} src={item.picture}/>*/}
                                            {/*</Tooltip>*/}
                                            {/*<RenderList*/}
                                            {/*    onClick={(key) => alert(Number(key))}*/}
                                            {/*    items={props.current_employees.map((items) => ({key: items.id, ...items}))}*/}
                                            {/*    map={(item, key) => {*/}
                                            {/*        return (*/}
                                            {/*            <Tooltip content={item.name}>*/}
                                            {/*                <Avatar classNames={{*/}
                                            {/*                    base: "!size-6"*/}
                                            {/*                }} alt={item.name} key={key} src={item.picture}/>*/}
                                            {/*            </Tooltip>)*/}

                                            {/*    }}*/}
                                            {/*/>*/}
                                        </AvatarGroup>)}

                                </div>
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
            ) : (<div className="grid place-items-center h-full"><Typography
                className="text-slate-700/50 font-semibold">No
                Row Selected</Typography></div>)}
        </Card>

        <LeaveTypeForm
            isOpen={editOpen}
            onOpen={setEditOpen}
            data={data}
            title="Update Leave Type"
            description="Kindly update the details for the leave type provided below."/>
    </>)
}