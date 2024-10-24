"use client"
import React, {Key, useCallback, useMemo, useState} from 'react';
import {usePaginateQuery} from "@/services/queries";
import {useToast} from "@/components/ui/use-toast";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {EmployeeLeaveCredits, LeaveCredits} from "@/types/leaves/leave-credits-types";
import DataDisplay from "@/components/common/data-display/data-display";
import {Avatar, Card, CardBody, CardHeader, cn, Tooltip} from '@nextui-org/react';
import Typography from "@/components/common/typography/Typography";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import {LuCalendarClock, LuCalendarDays, LuCalendarPlus} from "react-icons/lu";
import {icon_color, icon_size} from "@/lib/utils";
import CountUp from "react-countup";
import LeaveCreditForm from "@/components/admin/leaves/credits/leave-credit-form";
import {Employee} from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";


export interface EditCreditProp extends Employee{
    allocated_days: number,
    carry_forward_days: number,
}
function Page() {
    const {toast} = useToast()
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)
    const [leaveType, setLeaveType] = useState<LeaveCredits>()
    const [editCredit, setEditCredit] = useState<EditCreditProp>()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const {data, isLoading} = usePaginateQuery<EmployeeLeaveCredits>("/api/admin/leaves/leave-credit", page, rows, {
        refreshInterval: 3000
    });
    const leaveCredit = useMemo(() => {
        if (data?.data) {

            return data.data
        } else {
            return []
        }


    }, [data])

    const onOpenDrawer = useCallback(() => {
        setIsOpen(true)
    }, [setIsOpen])

    SetNavEndContent(() => {

        return (<>
            <Button {...uniformStyle()} onClick={onOpenDrawer}>
                Add Leave Credit
            </Button>
            <LeaveCreditForm onOpen={setIsOpen} isOpen={isOpen}/>
        </>)
    })

    // const handleRowKey = (key: Key) => {
    //     const data = leaveCredit.find((item) => item.id === Number(key))
    //     setLeaveType(data!)
    // }

    // useEffect(() => {
    //     const id = leaveType?.id
    //     if (!isEqual(leaveCredit, leaveType)) {
    //         setLeaveType(leaveCredit.find((item) => item.id === id))
    //     }
    // }, [leaveCredit, leaveType]);

    // const handleLeaveTypeDeleteMultiple = async (keys: Selection) => {
    //     const deleteKeys = keys === "all" ? leaveCredit.map((item) => item.id) // Collect all IDs
    //         : Array.from(keys).map(key => Number(key)); // Collect selected IDs and convert to numbers
    //
    //
    //     // Filter leaveData to find names of the deleted items
    //     const deletedNames = leaveCredit
    //         .filter(item => deleteKeys.includes(item.id)) // Use includes to check for matches
    //         .map(item => item.name) // Map to get the names
    //         .join(", "); // Join names into a string
    //
    //
    //     const res = await showDialog({
    //         title: "Delete Leave Type", message: (<Typography>Are you sure you want to delete this
    //             <Typography as="span"
    //                         className="font-semibold"> {deletedNames}</Typography>?
    //         </Typography>)
    //     })
    //
    //     if (res === "yes") {
    //         const res = await axiosInstance.post('/api/admin/leaves/leave-types/delete', deleteKeys)
    //         if (res.status !== 200) {
    //             toast({
    //                 title: "Error", description: res.data.message, variant: "danger",
    //             })
    //         }
    //
    //
    //     }
    //     if (res === "no") {
    //         return;
    //     }
    //
    // }

    const handleSelect = (edited: EditCreditProp) => {
        setIsEdit(true)
        setEditCredit(edited)
    }


    return (<section className='w-full h-full flex gap-4'>
        <DataDisplay
            // onSelect={(key) => alert(Number(key))}
            isLoading={isLoading}
            title="Leave Types"
            defaultDisplay="grid"
            data={leaveCredit}
            onGridDisplay={(data) => {
                return (<LeaveCreditCard
                        onSelect={handleSelect}
                        department={data.department}
                        earnings={data.earnings}
                        id={data.id}
                        leave_balance={data.leave_balance}
                        name={data.name}
                        picture={data.picture}
                        used_leaves={data.used_leaves}
                    />);
            }}
            // filterProps={{
            //     filterItems: filterLeaveTypes
            // }}
            // sortProps={{
            //     sortItems: [{
            //         key: "id", name: "ID"
            //     }, {key: "name", name: "Name"}, {key: "created_at", name: "Created At"}]
            //
            // }}
            // onDeleteSelected={async (keys) => {
            //     await handleLeaveTypeDeleteMultiple(keys)
            // }}
            searchProps={{
                searchingItemKey: ["name"]
            }}
            rowSelectionProps={{
                onRowChange: setRows
            }}
            paginationProps={{
                loop: true, data_length: data?.totalItems!, onChange: setPage
            }}
            // onTableDisplay={{
            //     config: LeaveTypeTableConfiguration,
            //     isLoading,
            //     onRowAction: handleRowKey,
            //     selectionMode: "multiple",
            //     layout: "auto"
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
        <LeaveCreditForm title="Update Leave Credit" description="Adjust and manage employee leave balances efficiently." onOpen={setIsEdit} isOpen={isEdit} employee={editCredit}/>
    </section>);
}

export default Page;

const LeaveCreditCard = ({onSelect, ...employee}: LeaveCredits & { onSelect?: (emp: EditCreditProp) => void }) => {
    const [percent, setPercent] = useState<number>(0)

    const maxLeaveCredit = (employee.leave_balance?.reduce((a, b) => b.allocated_days + b.total_earned_days, 0))!

    const edited = {
        name: employee.name,
        id: employee.id,
        department: employee.department,
        picture: employee.picture!,
        allocated_days: employee.leave_balance?.find(item => item.allocated_days)?.allocated_days!,
        carry_forward_days: employee.leave_balance?.find(item => item.carry_forward_days)?.carry_forward_days!,
    }
    let colorCode: string

    if (percent > 75) {
        colorCode = "rgb(34 197 94)"
    } else if (percent > 50) {
        colorCode = "rgb(249 115 22)"
    } else {
        colorCode = "rgb(239 68 68)"
    }

    return (<Card className="w-[270px] border-1" isHoverable isPressable shadow="none"
                  onClick={() => onSelect && onSelect(edited)}>
        <CardHeader className="flex gap-4 border-b-2 border-b-divider/20">
            <Avatar src={employee.picture!} alt={employee.name} isBordered/>
            {/*<Avatar className="h-20 w-20">*/}
            {/*    <AvatarImage src={employee.picture} alt={employee.name} />*/}
            {/*    <AvatarFallback>{employee.name.split(", ")[1][0]}{employee.name.split(", ")[0][0]}</AvatarFallback>*/}
            {/*</Avatar>*/}
            <div className="flex flex-col">
                <Typography className="text-left text-medium font-semibold truncate w-44">{employee.name}</Typography>
                <Typography className="text-left text-sm font-semibold">{employee.department}</Typography>
            </div>
        </CardHeader>
        <CardBody className="grid gap-4">
            <div className="flex flex-col items-center">
                <Typography className="text-xl font-semibold">Leave Credit</Typography>
                <Typography className="text-medium text-default-400/50">Current Leave Balance</Typography>
            </div>
            <div className="grid place-items-center">
                <AnimatedCircularProgressBar
                    max={maxLeaveCredit}
                    min={0}
                    value={employee.leave_balance?.find(item => item.remaining_days)?.remaining_days || 0}
                    gaugePrimaryColor={colorCode}
                    gaugeSecondaryColor={"rgba(0, 0, 0, 0.1)"}
                    onValueChange={setPercent}
                    explain="Leave Balance %"
                />
                <div className="flex justify-around w-full mt-3">
                    <Tooltip content="Allocated Days">
                        <div className="flex flex-col gap-1 items-center">
                            <LuCalendarDays className={cn("", icon_size, icon_color)}/>
                            <Typography className="text-xl font-bold flex flex-col items-center w-16">
                                <CountUp start={0}
                                         end={employee.leave_balance?.find(item => item.allocated_days)?.allocated_days!}
                                         decimals={2}/>
                                <Typography as="span"
                                            className="font-normal text-slate-700/50 text-sm">day/s</Typography>
                            </Typography>
                        </div>
                    </Tooltip>
                    <Tooltip content="Remaining Days">
                        <div className="flex flex-col gap-1 items-center">
                            <LuCalendarClock className={cn("", icon_size, icon_color)}/>
                            <Typography className="text-xl font-bold flex flex-col items-center w-16">
                                <CountUp start={0}
                                         end={employee.leave_balance?.find(item => item.remaining_days)?.remaining_days!}
                                         decimals={2}/>
                                <Typography as="span"
                                            className="font-normal text-slate-700/50 text-sm">day/s</Typography>
                            </Typography>
                        </div>
                    </Tooltip>
                    <Tooltip content="Earned Days">
                        <div className="flex flex-col gap-1 items-center">
                            <LuCalendarPlus className={cn("", icon_size, icon_color)}/>
                            <Typography className="text-xl font-bold flex flex-col items-center w-16">
                                <CountUp start={0}
                                         end={employee.leave_balance?.find(item => item.total_earned_days)?.total_earned_days!}
                                         decimals={2}/>
                                <Typography as="span"
                                            className="font-normal text-slate-700/50 text-sm">day/s</Typography>
                            </Typography>
                        </div>
                    </Tooltip>
                </div>

            </div>
            {/*<div>*/}
            {/*    <h3 className="mb-2 font-semibold">Used Leaves</h3>*/}
            {/*    {employee.usedLeaves.map((leave, index) => (*/}
            {/*        <div key={index} className="flex items-center justify-between py-2">*/}
            {/*            <div className="flex items-center gap-2">*/}
            {/*                <MinusCircle className="h-5 w-5 text-red-500" />*/}
            {/*                <span>{leave.leaveTypeName}</span>*/}
            {/*            </div>*/}
            {/*            <div className="flex items-center gap-2">*/}
            {/*                <Chip variant="bordered">{leave.usedDays} days</Chip>*/}
            {/*                <Chip variant="flat">{leave.status}</Chip>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*</div>*/}
            {/*<div>*/}
            {/*    <h3 className="mb-2 font-semibold">Earned Leaves</h3>*/}
            {/*    {employee.earnedLeaves.map((leave, index) => (*/}
            {/*        <div key={index} className="flex items-center justify-between py-2">*/}
            {/*            <div className="flex items-center gap-2">*/}
            {/*                <PlusCircle className="h-5 w-5 text-green-500" />*/}
            {/*                <span>{leave.leaveTypeName}</span>*/}
            {/*            </div>*/}
            {/*            <div className="flex items-center gap-2">*/}
            {/*                <Chip variant="bordered">{leave.earnedDays} days</Chip>*/}
            {/*                <span className="text-sm text-muted-foreground">{new Date(leave.dateEarned).toLocaleDateString()}</span>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*</div>*/}
        </CardBody>
    </Card>)
}