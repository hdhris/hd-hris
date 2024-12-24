"use client"

import React, {Key, useCallback, useMemo, useState} from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {Button} from "@nextui-org/button";
import {uniformChipStyle, uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {FilterItems} from "@/components/admin/leaves/table-config/approval-tables-configuration";
import DataDisplay from "@/components/common/data-display/data-display";
import {usePaginateQuery} from "@/services/queries";
import Typography from "@/components/common/typography/Typography";
import BenefitPlanForm from "@/components/admin/benefits/plans/form/benefit-plan-form";
import {BenefitPlan, BenefitPlanPaginated} from "@/types/benefits/plans/plansTypes";
import PlanDetails from "@/components/admin/benefits/plans/plan-details";
import showDialog from "@/lib/utils/confirmDialog";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from '@/components/ui/use-toast';
import {BenefitTable} from "@/components/admin/benefits/plans/table-form-config/table-config";
import CardView from "@/components/common/card-view/card-view";
import {Chip} from "@nextui-org/chip";
import {getColor} from "@/helper/background-color-generator/generator";
import CardTable from "@/components/common/card-view/card-table";
import {pluralize} from "@/helper/pluralize/pluralize";
import {capitalize} from "@nextui-org/shared-utils";
import EmployeesAvatar from "@/components/common/avatar/employees-avatar";
import {IoMdInformationCircle} from "react-icons/io";
import {icon_size_sm} from "@/lib/utils";

function PlansDataDisplay() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [onEditAndDelete, setOnEditAndDelete] = useState<boolean>(false)
    const [planModal, setPlanModal] = useState<BenefitPlan>()
    const {toast} = useToast()
    const onOpenDrawer = useCallback(() => {
        setIsOpen(true)
    }, [setIsOpen])

    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)

    const {data, isLoading} = usePaginateQuery<BenefitPlanPaginated>("/api/admin/benefits/plans", page, rows, {
        refreshInterval: 3000
    });
    const benefitPlans = useMemo(() => {
        if (data) {
            if (planModal) {
                setPlanModal((prevState) => data.data.find(item => item.id === prevState?.id))
            }
            return data.data
        }
        return []
    }, [data, planModal])

    const navEndContent = useCallback(() => {
        return (<>
            <Button {...uniformStyle()} onPress={onOpenDrawer}>
                Add New Plan
            </Button>
            <BenefitPlanForm onOpen={setIsOpen} isOpen={isOpen}/>
        </>)
    }, [onOpenDrawer, isOpen]);

    SetNavEndContent(navEndContent)


    const handlePlanSelection = (id: Key) => {

        setPlanModal(benefitPlans.find(item => item.id === Number(id)))


    }
    const handleEditPlan = useCallback((id: Key) => {
        setPlanModal(benefitPlans.find(item => item.id === id))
    }, [benefitPlans])

    // useEffect(() => {
    //     if (!onEditAndDelete && planModal) {
    //         setOnEditAndDelete(true)
    //     }
    const handleDeletePlan = async (key: number | string, deduction_id: number, name: string) => {
        const res = await showDialog({
            title: "Delete Confirmation",
            message: <Typography>Do you want to delete <span className="font-semibold">{name}</span> plan? This process
                can&apos;t be undone.</Typography>
        });


        if (res === "yes") {
            // Store the previous state in case we need to revert it
            try {
                const response = await axiosInstance.post("/api/admin/benefits/plans/delete", {id: key, deduction_id});

                if (response.status === 200) {
                    toast({
                        title: "Success", description: `${name} has been deleted successfully.`, variant: "success"
                    });
                }
            } catch (error) {
                // Revert the state if an error occurs

                // Display an error message to the user
                toast({
                    title: "Error", description: `Failed to delete ${name}. Please try again.`, variant: "danger",
                });

                console.error("Termination error:", error);
            }
        }
    }

    // }, [onEditAndDelete, planModal]);
    return (<section className='h-full flex gap-4'>
        <DataDisplay
            isLoading={isLoading}
            defaultDisplay="table"
            data={benefitPlans}
            title="Leave Requests"
            filterProps={{
                filterItems: FilterItems
            }}
            // onTableDisplay={{
            //     config: TableConfigurations, layout: "auto"
            // }}
            searchProps={{
                searchingItemKey: ["name"]
            }}
            sortProps={{
                sortItems: [{
                    name: "ID", key: "id"
                }]
            }}
            rowSelectionProps={{
                onRowChange: setRows
            }}
            paginationProps={{
                loop: true, data_length: data?.totalItems!, onChange: setPage
            }}
            onTableDisplay={{
                config: BenefitTable,
                onRowAction: handlePlanSelection,
            }}
            onView={
                planModal && <CardView
                    className="w-[400px]"
                    title="Benefit Plan"
                    // onDelete={() => handleLeaveTypeDelete(props.id)}
                    // onEdit={() => handleLeaveTypeEdit(!editOpen)}
                    // editProps={{
                    //     isDisabled: props.current_employees.length > 0
                    // }}
                    // deleteProps={{
                    //     isLoading: loading,
                    //     isDisabled: props.current_employees.length > 0
                    // }}
                    onClose={() => setPlanModal(undefined)}
                    header={<div
                        className="flex flex-col gap-2 h-32 bg-opacity-50 backdrop-blur-sm w-full">
                        <div className="flex items-center gap-5 w-fit">
                            <Typography className="text-2xl font-bold">{planModal.name}</Typography>
                            {/*<Chip style={{*/}
                            {/*    background: getColor(props.code, 0.2),*/}
                            {/*    borderColor: getColor(props.code, 0.5),*/}
                            {/*    color: getColor(props.code)*/}
                            {/*}} variant="bordered" classNames={{*/}
                            {/*    content: "font-bold",*/}
                            {/*}}>*/}
                            {/*    {props.code}*/}
                            {/*</Chip>*/}
                        </div>
                        <div className="text-pretty break-words h-24">
                            <Typography className="text-sm text-justify indent-5 h-[4rem]">
                                {/*{props.description}*/}
                            </Typography>
                        </div>
                    </div>}
                    body={
                        <></>
                        // <CardTable data={[//     {
                        // //     label: "Minimum Days", value: pluralize(props.min_duration, "day")
                        // // },
                        // {label: "Maximum Days", value: pluralize(props.max_duration, "day")}, {
                        //     label: "Applicable for",
                        //     value:  <div className="flex flex-wrap gap-2">{props.applicable_to_employee_types.map(item => (
                        //         <Chip key={item.id} {...uniformChipStyle(item.name)} variant="bordered"
                        //               className="rounded" size="sm">{capitalize(item.name)}</Chip>))}</div>
                        //
                        // }, {
                        //     label: "Current Usage",
                        //     value: <EmployeesAvatar employees={curr_emp} handleEmployeePicture={handleEmployeePicture}/>
                        // }, {
                        //     label: "Leave Compensation Status", value: props.paid_leave ? "Paid Leave" : "Unpaid Leave"
                        // }, {
                        //     label: "Attachment Status", value: props.attachment_required ? "Required" : "Not Required"
                        // }, {
                        //     label: "Created At", value: props.created_at
                        // }, {
                        //     label: "Updated At", value: props.updated_at
                        // },]}/>
                    }
                    // onDanger={
                    //     <div className="w-full">{props.current_employees.length > 0 && <Chip className="bg-[#338EF7] text-white min-w-full" radius="sm" startContent={<IoMdInformationCircle className={icon_size_sm}/>}>Note. This leave cannot be edited or deleted.</Chip>}</div>
                    // }
                />
            }
            // onListDisplay={(data) => {
            //     return (<BorderCard>{data.name}</BorderCard>)
            // }}
            // onGridDisplay={(plan, key) => {
            //     return (<ContextMenu>
            //         <ContextMenuTrigger>
            //             <Card className="w-[270px] h-[250px] border-2" shadow="none" style={{
            //                 borderColor: plan.isActive ? "#17c964" : "#f31260"
            //             }} isHoverable>
            //                 <CardHeader className="flex-col items-start">
            //                     <Typography className="flex items-center gap-2 font-semibold">
            //                         {plan.name}
            //                     </Typography>
            //                     <Typography
            //                         className="text-sm !text-default-400/75 text-justify">{plan.description}</Typography>
            //                 </CardHeader>
            //                 <CardBody className="flex flex-col justify-between">
            //                     <PlanTypeChip type={plan.type}/>
            //                     <Typography
            //                         className="text-sm mb-2 truncate break-normal">{plan.coverageDetails}</Typography>
            //                     <div className="flex justify-between items-center mt-4">
            //                         <Button variant="bordered" size="sm" onPress={() => handlePlanSelection(key)}>
            //                             View Details
            //                         </Button>
            //                         {/*<Modal isOpen={isModalOpen} onOpenChange={onOpenChange} isDismissable={false}*/}
            //                         {/*       isKeyboardDismissDisabled={true}>*/}
            //                         {/*    <ModalContent>*/}
            //                         {/*        <ModalBody className="py-10">*/}
            //                         {/*            <PlanDetails {...planModal!}/>*/}
            //                         {/*        </ModalBody>*/}
            //                         {/*    </ModalContent>*/}
            //                         {/*</Modal>*/}
            //                         <div className="text-xs text-muted-foreground">
            //                             {plan.effectiveDate} - {plan.expirationDate}
            //                         </div>
            //                     </div>
            //                 </CardBody>
            //             </Card>
            //         </ContextMenuTrigger>
            //         <ContextMenuContent>
            //             <ContextMenuItem onClick={() => {
            //                 handleEditPlan(key)
            //                 setOnEditAndDelete(true)
            //             }}>Edit</ContextMenuItem>
            //             <ContextMenuItem
            //                 onClick={() => handleDeletePlan(key, plan.deduction_id, plan.name)}>Delete</ContextMenuItem>
            //         </ContextMenuContent>
            //     </ContextMenu>)
            // }}
        />


        {/*{planModal && <PlanDetails {...planModal!}/>}*/}
        <BenefitPlanForm plan={planModal} title="Update Plan" description="Update an existing plan"
                         onOpen={setOnEditAndDelete} isOpen={onEditAndDelete}/>

    </section>);
}

export default PlansDataDisplay;