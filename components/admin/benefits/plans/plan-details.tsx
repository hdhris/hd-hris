"use client"
import {Button, Card, Chip, cn, Divider, Tab, Tabs, Tooltip} from "@nextui-org/react"
import {BenefitPlan} from "@/types/benefits/plans/plansTypes";
import Typography from "@/components/common/typography/Typography";
import PlanTypeChip from "@/components/admin/benefits/plans/plan-type-chip";
import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import BorderCard from "@/components/common/BorderCard";
import {Info, Percent, Wallet} from "lucide-react";
import {CardBody} from "@nextui-org/card";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {icon_color, icon_size_sm} from "@/lib/utils";
import {numberWithCommas} from "@/lib/utils/numberFormat";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import EnrollEmployeeForm from "@/components/admin/benefits/plans/form/enroll-employee-form";
import RenderList from "@/components/util/RenderList";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import useSearch from "@/hooks/utils/useSearch";
import Search from "@/components/util/search";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger
} from "@/components/ui/context-menu";
import showDialog from "@/lib/utils/confirmDialog";
import {EmployeeDetails} from "@/types/employeee/EmployeeType";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";

export default function PlanDetails({...props}: BenefitPlan) {
    const [isOpenEnrollment, setIsOpenEnrollment] = useState<boolean>(false)
    const {toast} = useToast()
    const [employeesEnrolled, setEmployeesEnrolled] = useState<EmployeeDetails[]>( [])
    const details = props.benefitAdditionalDetails ? props.benefitAdditionalDetails : null

    useEffect(() => {
        if(props.employees_avails) setEmployeesEnrolled(props.employees_avails)
    }, [props.employees_avails])
    const handleTerminate = async (key: number, plan_id: number, name: string) => {
        const res = await showDialog({
            title: "Terminate Confirmation",
            message: <Typography>Do you want to terminate <span className="font-semibold">{name}</span>? This process
                can&apos;t be undone.</Typography>
        });


        if (res === "yes") {
            // Store the previous state in case we need to revert it
            const previousEmployees = [...employeesEnrolled];

            // Optimistically update the state
            setEmployeesEnrolled((prevState) => prevState.filter((item) => item.id !== key));

            try {
                const response = await axiosInstance.post("/api/admin/benefits/plans/terminate", { key, plan_id });

                if (response.status === 200) {
                    toast({
                        title: "Success",
                        description: `${name} has been terminated successfully.`,
                        variant: "success"
                    });
                }
            } catch (error) {
                // Revert the state if an error occurs
                setEmployeesEnrolled(previousEmployees);

                // Display an error message to the user
                toast({
                    title: "Error",
                    description: `Failed to terminate ${name}. Please try again.`,
                    variant: "danger",
                });

                console.error("Termination error:", error);
            }
        }

    }
    const {searchValue, onSearchChange, itemSearched, searchingItemKey} = useSearch(employeesEnrolled!, ["name"])
    return (<>
        <BorderCard className="w-[40%] overflow-hidden pb-10">
            <div className="flex justify-between w-full">
                <div className="flex flex-col gap-2">
                    <Typography className="font-semibold text-2xl">{props.name}</Typography>
                    <PlanTypeChip type={props.type}/>
                </div>
                <Chip color={props.isActive ? "success" : "danger"}>{props.isActive ? "Active" : "Inactive"}</Chip>
            </div>
            <Typography
                className="text-default-400/50 text-medium indent-4 text-justify">{props.description}</Typography>

            <Tabs aria-label="Benefit Details" className="mt-4" classNames={{
                panel: "h-[70%]"
            }}>
                <Tab key="basic_info" title="Basic Info">
                    <div className="rounded border-1 my-2 px-2 flex flex-col gap-2 overflow-hidden">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-2 p-4 w-fit items-center">
                                <Typography className="font-semibold text-medium">Employee Rate %</Typography>
                                <div className="p-2 rounded-full bg-default-400/50 w-fit">
                                    <Typography as="span"
                                                className="text-xl font-semibold">{props.benefitAdditionalDetails?.employeeContribution}%</Typography>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 p-2 w-fit items-center">
                                <Typography className="font-semibold text-medium">Employer Rate %</Typography>
                                <div className="p-2 rounded-full bg-default-400/50 w-fit">
                                    <Typography as="span"
                                                className="text-xl font-semibold">{props.benefitAdditionalDetails?.employerContribution}%</Typography>
                                </div>
                            </div>
                        </div>

                    </div>

                    <Divider/>
                    <div className="mt-4">
                        <div className="flex gap-2 items-center justify-between">
                            <Typography className="font-semibold text-medium">Coverage Period</Typography>
                            <Typography
                                className="ml-8 text-sm font-semibold underline underline-offset-4">{dayjs(props.effectiveDate).format("MMM DD, YYYY")} - {dayjs(props.expirationDate).format("MMM DD, YYYY")}</Typography>

                        </div>
                    </div>
                </Tab>
                <Tab key="coverage_details" title="Coverage Details">
                    <Typography
                        className="text-default-400/50 text-medium indent-4 text-justify">{props.coverageDetails}</Typography>
                </Tab>
                <Tab key="enrolled" title="Enrolled">
                    <div className="h-full overflow-hiden"> {/* Changed overflow from hidden to auto */}
                        <div className="flex justify-between items-center mb-2">
                            <Typography className="font-semibold text-medium">Enrolled Employees</Typography>
                            <Button {...uniformStyle()} onPress={() => setIsOpenEnrollment(true)}>
                                Enroll Employee
                            </Button>
                        </div>
                        {/* Ensure ScrollShadow container has overflow set to auto */}
                        <Search value={searchValue} onChange={onSearchChange} searchingItemKey={searchingItemKey!}
                                className="h-12 w-full"/>

                        <ScrollShadow className="p-4 w-full h-[70%] mb-4 overflow-y-auto">
                            <div className="flex gap-4 w-full flex-wrap">
                                <RenderList
                                    items={itemSearched.map(item => ({key: item.id, ...item}))}
                                    map={(users) => {

                                        return <ContextMenu>
                                            <ContextMenuTrigger>
                                                <UserAvatarTooltip user={users} avatarProps={{
                                                    size: "md"
                                                }}/>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent className="rounded">
                                                <ContextMenuItem onClick={async () => {
                                                    await handleTerminate(Number(users.key), props.id, users.name)
                                                }}><Typography><span className="font-semibold">Terminate</span> {users.name}</Typography></ContextMenuItem>
                                                <ContextMenuSeparator/>
                                                <ContextMenuItem>View Details</ContextMenuItem>
                                            </ContextMenuContent>
                                        </ContextMenu>
                                    }}/>

                            </div>

                            {/*<EmployeesAvatar*/}
                            {/*    employees={props.employees_avails!}*/}
                            {/*    max={props.employees_avails?.length!}*/}
                            {/*    isBordered*/}
                            {/*    isGrid*/}
                            {/*/>*/}
                        </ScrollShadow>
                    </div>
                </Tab>

                {details && <Tab key="thresholds" title="Thresholds">
                    <ScrollShadow className="h-full space-y-8 pb-5 pr-5">
                        {[{
                            icon: Wallet,
                            title: "Salary Range",
                            data: [{label: "Minimum", value: numberWithCommas(details.minSalary || 0)}, {
                                label: "Maximum", value: numberWithCommas(details.maxSalary || 0)
                            }]
                        }, {
                            icon: Percent,
                            title: "MSC Range",
                            data: [{label: "Minimum", value: numberWithCommas(details.minMSC || 0)}, {
                                label: "Maximum", value: numberWithCommas(details.maxMSC || 0)
                            }, {label: "Step", value: numberWithCommas(details.mscStep || 0)}]
                        }].map((section, index) => (
                            <Card key={index} className="bg-white dark:bg-gray-800 border-1" shadow="none">
                                <CardBody>
                                    <div className="flex items-center gap-2 mb-4">
                                        <section.icon className={cn(icon_color, icon_size_sm)}/>
                                        <Typography className="text-sm font-medium">{section.title}</Typography>
                                    </div>
                                    <div className={`grid grid-cols-${section.data.length} gap-4`}>
                                        {section.data.map((item, idx) => (<div key={idx} className="space-y-1">
                                            <Typography className="text-xs">{item.label}</Typography>
                                            <Typography className="font-medium text-lg">{item.value}</Typography>
                                        </div>))}
                                    </div>
                                </CardBody>
                            </Card>))}
                        <div className="pt-6 border-t-2">
                            <Typography className="text-sm font-medium mb-4">Additional
                                Thresholds</Typography>
                            <div className="space-y-4">
                                {[{
                                    label: "EC Threshold",
                                    value: numberWithCommas(details.ecThreshold || 0),
                                    tooltip: "Employees' Compensation threshold"
                                }, {
                                    label: "EC Rate Range",
                                    value: `${details.ecLowRate || 0}% - ${details.ecHighRate || 0}%`,
                                    tooltip: "Employees' Compensation rate range"
                                }, {
                                    label: "WISP Threshold",
                                    value: numberWithCommas(details.wispThreshold || 0),
                                    tooltip: "Workers' Investment and Savings Program threshold"
                                }].map((item, index) => (<div key={index} className="flex justify-between items-center">
                                    <Typography as="span" className="text-sm ">{item.label}</Typography>
                                    <div className="flex items-center gap-2">
                                        <Typography as="span" className="font-medium text-lg">{item.value}</Typography>
                                        <Tooltip content={item.tooltip}>
                                            <Button isIconOnly size="sm" variant="light" className="text-blue-500">
                                                <Info className="h-4 w-4"/>
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>))}
                            </div>
                        </div>
                    </ScrollShadow>

                </Tab>}
            </Tabs>

            {/*<Divider/>*/}
        </BorderCard>
        <EnrollEmployeeForm plan_id={props?.id!} onOpen={setIsOpenEnrollment} isOpen={isOpenEnrollment}/>
    </>)
}