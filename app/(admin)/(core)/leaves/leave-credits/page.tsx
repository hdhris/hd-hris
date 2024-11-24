"use client"
import React, {useCallback, useMemo, useState} from 'react';
import {usePaginateQuery} from "@/services/queries";
import {useToast} from "@/components/ui/use-toast";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {EmployeeLeaveCredits, LeaveCredits} from "@/types/leaves/leave-credits-types";
import DataDisplay from "@/components/common/data-display/data-display";
import {
    Accordion, AccordionItem, Avatar, Card, CardBody, CardHeader, Chip, cn, Progress, Tooltip, User
} from '@nextui-org/react';
import Typography from "@/components/common/typography/Typography";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import {LuCalendarClock, LuCalendarDays} from "react-icons/lu";
import {icon_color, icon_size} from "@/lib/utils";
import CountUp from "react-countup";
import LeaveCreditForm from "@/components/admin/leaves/credits/leave-credit-form";
import {IoChevronDown} from "react-icons/io5";
import DropdownList from "@/components/common/Dropdown";
import CardView from "@/components/common/card-view/card-view";
import NoData from "@/components/common/no-data/NoData";
import {capitalize} from "@nextui-org/shared-utils";
import {mutate} from "swr";
import showDialog from "@/lib/utils/confirmDialog";
import {axiosInstance} from "@/services/fetcher";


export interface EditCreditProp extends Omit<LeaveCredits, "leave_balance"> {
    leave_credits: {
        id: number
        leave_type_id: string,
        allocated_days: number,
        carry_forward_days: number,
        remaining_days: number,
        used_days: number
        leave_type: {
            id: number, name: string
        }
    }[] | undefined
}


function Page() {
    const {toast} = useToast()
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)
    const [year, setYear] = useState<number>(new Date().getFullYear())
    const [editCredit, setEditCredit] = useState<EditCreditProp>()
    const [viewCredit, setViewCredit] = useState<EditCreditProp>()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const {data, isLoading} = usePaginateQuery<EmployeeLeaveCredits>("/api/admin/leaves/leave-credit", page, rows, {
        refreshInterval: 3000
    }, `&year=${year}`);
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
        console.log("Data: ", data)
        console.log("Edited: ", edited)
        // setEditCredit(edited)
        setViewCredit(edited)
    }

    const handleDelete = async (deleted: EditCreditProp) => {


        const leave_credit_ids = deleted.leave_credits?.map((item) => item.id)

        const onConfirm = await showDialog({
            title: "Delete Leave Credit", message: (<Typography>Are you sure you want to delete this
                <Typography as="span" className="font-semibold"> {deleted.name}</Typography>?
            </Typography>)
        })

        if(onConfirm === "yes"){
            const res = await axiosInstance.post('/api/admin/leaves/leave-credit/delete', leave_credit_ids)
            if (res.status !== 200) {
                toast({
                    title: "Error", description: res.data.message, variant: "danger",
                })
            } else {
                toast({
                    title: "Success", description: res.data.message, variant: "success",
                })
                // await mutate()
            }
        }
        // const res = await axiosInstance.delete(`/api/admin/leaves/leave-credit?id=${id}`)
        // if (res.status !== 200) {
        //     toast({
        //         title: "Error", description: res.data.message, variant: "danger",
        //     })
        // } else {
        //     toast({
        //         title: "Success", description: res.data.message, variant: "success",
        //     })
        //     // await mutate()
        // }
    }


    return (<section className='w-full h-full flex gap-4 overflow-hidden'>
        <DataDisplay
            // onSelect={(key) => alert(Number(key))}
            addFunction={<DropdownList
                selectionMode="single"
                selectedKeys={new Set([String(year)])}
                onSelectionChange={(key) => setYear(Number(Array.from(key)[0]))}
                items={data?.meta_data.years.map((year) => ({
                    label: String(year), key: String(year),
                })) || []}
                trigger={{
                    label: (<p className="font-semibold text-blue-500">{year}</p>), props: {
                        ...uniformStyle({color: "default", radius: "md"}),
                        variant: "bordered",
                        endContent: <IoChevronDown/>,
                    },
                }}
                onAction={(key) => setYear(Number(key))}
            />}
            isLoading={isLoading}
            title="Leave Types"
            defaultDisplay="grid"
            data={leaveCredit}
            onGridDisplay={(data) => {
                return (<LeaveCreditCard
                    onSelect={handleSelect}
                    department={data.department}
                    id={data.id}
                    leave_balance={data.leave_balance}
                    name={data.name}
                    picture={data.picture}
                    employment_status={data.employment_status}
                    job={data.job}/>);
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
                loop: true, data_length: data?.meta_data.totalItems, onChange: setPage
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

        {viewCredit && <CardView
            title="Leave Credit"
            onClose={() => setViewCredit(undefined)}
            onEdit={() => {
                setIsEdit(true)
                setEditCredit(viewCredit)
            }}

            onDelete={async () => {
                console.log("Credit: ", viewCredit)
                await handleDelete(viewCredit)
            }}

            header={<div className="flex flex-row items-center space-x-4 pb-2">
                <User name={<div className="flex gap-2">
                    <Typography>{viewCredit.name}</Typography>
                    <Chip
                        color={viewCredit.employment_status === "regular" ? "success" : "warning"}>{capitalize(viewCredit.employment_status)}</Chip>
                </div>}
                      description={viewCredit.department}
                      classNames={{
                          name: "text-medium font-semibold", description: "text-sm font-semibold text-default-400/80"
                      }}
                      avatarProps={{
                          src: viewCredit.picture!
                      }}/>

            </div>}

            body={<div className="space-y-4">
                <Accordion showDivider={false} defaultSelectedKeys={["0"]} aria-label="Leave Credits"
                           aria-labelledby="Leave Credits">
                    {viewCredit.leave_credits && viewCredit.leave_credits?.length > 0 ? (viewCredit.leave_credits.map((leave, index) => {
                        const percent = (leave.remaining_days / leave.allocated_days) * 100;
                        const color = percent > 75 ? "success" : percent > 50 ? "warning" : "danger";

                        return (<AccordionItem
                            aria-labelledby="Leave Credits"
                            className="overflow-hidden"
                            key={index}
                            aria-label={leave.leave_type.name}
                            title={<>
                                <div className="flex justify-between text-sm">
                                    <span>{leave.leave_type.name}</span>
                                    <CountUp start={0} end={percent} suffix=" %"/>
                                </div>
                                <Progress aria-label="Leave Credit Progress" color={color} value={percent} className="h-2"/>
                            </>}
                        >
                            <table className="w-full text-sm">
                                <tbody>
                                {[{
                                    label: "Allocated Days", value: leave.allocated_days
                                }, {label: "Remaining Days", value: leave.remaining_days}, {
                                    label: "Used Days", value: leave.used_days
                                }, {
                                    label: "Carry Forward", value: leave.carry_forward_days
                                },].map((item, idx) => (<tr key={idx} className="border-b last:border-b-0">
                                    <td className="py-2 px-4 text-gray-500">{item.label}</td>
                                    <td className="py-2 px-4">{item.value}</td>
                                </tr>))}
                                </tbody>
                            </table>
                        </AccordionItem>);
                    })) : (<NoData message="No Leave Credit"/>)}
                </Accordion>

            </div>}
            footer={<></>}

        />}

        <LeaveCreditForm title="Update Leave Credit"
                         description="Adjust and manage employee leave balances efficiently."
                         onOpen={setIsEdit}
                         isOpen={isEdit}
                         employee={editCredit}/>
    </section>);
}

export default Page;

const LeaveCreditCard = ({onSelect, ...employee}: LeaveCredits & { onSelect?: (emp: EditCreditProp) => void }) => {
    const [percent, setPercent] = useState<number>(0)

    const maxLeaveCredit = (employee.leave_balance?.filter(balance => balance.allocated_days).reduce((a, b) => a + b.allocated_days, 0))!
    const remaining = employee.leave_balance?.filter(item => item.remaining_days)?.reduce((a, b) => a + b.remaining_days, 0)
    const edited: EditCreditProp = {
        name: employee.name,
        id: employee.id,
        department: employee.department,
        picture: employee.picture!,
        job: employee.job,
        employment_status: employee.employment_status,
        leave_credits: employee.leave_balance?.map(item => ({
            id: item.id,
            leave_type_id: String(item.leave_type.id),
            remaining_days: item.remaining_days,
            allocated_days: item.allocated_days,
            used_days: item.used_days,
            carry_forward_days: item.carry_forward_days,
            leave_type: item.leave_type
        }))

        // allocated_days: employee.leave_balance?.find(item => item.allocated_days)?.allocated_days!,
        // carry_forward_days: employee.leave_balance?.find(item => item.carry_forward_days)?.carry_forward_days!,
    }
    let colorCode: string

    if (percent > 75) {
        colorCode = "rgb(34 197 94)"
    } else if (percent > 50) {
        colorCode = "rgb(249 115 22)"
    } else {
        colorCode = "rgb(239 68 68)"
    }

    return (<Card className="border-1 w-full max-w-[270px]" isHoverable isPressable shadow="none"
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
                    value={remaining || 0}
                    gaugePrimaryColor={colorCode}
                    gaugeSecondaryColor={"rgba(0, 0, 0, 0.1)"}
                    onValueChange={setPercent}
                    explain="Leave Balance %"
                />
                <div className="flex justify-between w-full mt-3">
                    <Tooltip content="Allocated Days">
                        <div className="flex flex-col gap-1 items-center">
                            <LuCalendarDays className={cn("", icon_size, icon_color)}/>
                            <Typography className="text-xl font-bold flex flex-col items-center w-16">
                                <CountUp start={0}
                                         end={maxLeaveCredit}
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
                                         end={remaining!}
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