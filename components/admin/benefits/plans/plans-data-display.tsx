"use client"

import {isEqual} from "lodash";
import {Chip} from "@nextui-org/chip";
import {Button} from "@nextui-org/button";
import {Divider} from "@nextui-org/divider";
import {axiosInstance} from "@/services/fetcher";
import showDialog from "@/lib/utils/confirmDialog";
import {useToast} from '@/components/ui/use-toast';
import {useBenefitMembership, usePaginateQuery} from "@/services/queries";
import {numberWithCommas} from "@/lib/utils/numberFormat";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import CardView from "@/components/common/card-view/card-view";
import CardTable from "@/components/common/card-view/card-table";
import {getColor} from "@/helper/background-color-generator/generator";
import DataDisplay from "@/components/common/data-display/data-display";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import React, {Key, useCallback, useEffect, useMemo, useState} from 'react';
import {BenefitPlan, BenefitPlanPaginated} from "@/types/benefits/plans/plansTypes";
import {BenefitTable} from "@/components/admin/benefits/plans/table-form-config/table-config";
import {FilterItems} from "@/components/admin/leaves/table-config/approval-tables-configuration";
import Typography, {boldSurroundedText, Section} from "@/components/common/typography/Typography";
import {Alert} from "@nextui-org/alert";
import PlanForm from "@/components/admin/benefits/plans/form/plan-form";
import EditPlanForm from "@/components/admin/benefits/plans/form/edit-plan";
import EnrollEmployeeForm from "@/components/admin/benefits/plans/form/enroll-employee-form";
import {pluralize} from "@/helper/pluralize/pluralize";
import {capitalize} from "@nextui-org/shared-utils";

function PlansDataDisplay() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [onEditAndDelete, setOnEditAndDelete] = useState<boolean>(false)
    const [isOpenEnrolled, setIsOpenEnrolled] = useState<boolean>(false)
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
    //
    // const {data: members} = useBenefitMembership({page, rows});

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
            <PlanForm onOpen={setIsOpen} isOpen={isOpen}/>
        </>)
    }, [onOpenDrawer, isOpen]);

    SetNavEndContent(navEndContent)


    useEffect(() => {
        const id = planModal?.id
        if (!isEqual(benefitPlans, planModal)) {
            setPlanModal(benefitPlans.find((item) => item.id === id))
        }
    }, [benefitPlans, planModal]);

    const handlePlanSelection = (id: Key) => {
        setPlanModal(benefitPlans.find(item => item.id === Number(id)))
    }
    const handleEditPlan = useCallback((id: Key) => {
        // alert("Key: " + id)
        setPlanModal(benefitPlans.find(item => item.id === Number(id)))
    }, [benefitPlans])

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
            title="Benefit Plans"
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
                config: BenefitTable, onRowAction: handlePlanSelection,
            }}
            onView={planModal && <CardView
                className="w-[450px]"
                title="Benefit Plan"
                onDelete={() => handleDeletePlan(planModal?.id, planModal.deduction_id, planModal.name)}
                onEdit={() => {
                    handleEditPlan(planModal.id!)
                    setOnEditAndDelete(true)
                }}
                // editProps={{
                //     isDisabled: props.current_employees.length > 0
                // }}
                deleteProps={{
                    // isLoading: loading,
                    isDisabled: planModal.employees_avails?.length! > 0,
                    children: planModal.employees_avails?.length! > 0 && <Alert color="danger"
                                                                                description={`Couldn't Delete Plan. There ${planModal.employees_avails?.length! > 1 ? "are " : "is"} ${pluralize(planModal.employees_avails?.length!, "employee")} assigned to this plan.`}/>
                }}
                onClose={() => setPlanModal(undefined)}
                body={<>
                    <div>
                        <Section title="Plan Rates" subtitle="Employee and employer rates based on salary."
                                 className="ms-0 mb-2">
                            <Chip className="rounded">{capitalize(planModal?.benefitAdditionalDetails?.find(item => item.contributionType)?.contributionType || "")}</Chip>
                        </Section>
                        {planModal.benefitAdditionalDetails?.some(item => item.contributionType === "others") ?
                            <CardTable
                                data={[{
                                    label: "Salary Bracket",
                                    value: <div className="flex justify-between"><Typography className="font-semibold">Employee
                                        Rate</Typography><Typography className="font-semibold">Employer
                                        Rate</Typography>
                                    </div>
                                }, ...planModal.benefitAdditionalDetails?.sort((a, b) => a.minSalary! - b.minSalary!).map((item) => ({
                                    label: `${numberWithCommas(Number(item.minSalary)!)} - ${numberWithCommas(Number(item.maxSalary)!)}`,
                                    value: <div className="flex justify-between px-10">
                                        <Typography>{item.employeeContribution}%</Typography><Typography>{item.employerContribution}%</Typography>
                                    </div>
                                }))!]}
                            /> : <CardTable
                                data={[{
                                    label: "Salary Bracket", value: "Amount"
                                }, ...planModal.benefitAdditionalDetails?.sort((a, b) => a.minSalary! - b.minSalary!).map((item) => ({
                                    label: `${numberWithCommas(Number(item.minSalary)!)} - ${numberWithCommas(Number(item.maxSalary)!)}`,
                                    value: item.actualContributionAmount
                                }))!]}
                            />}
                    </div>
                    {planModal.benefitAdditionalDetails?.some(item => item.minMSC) && <div>
                        <Section title="Additional Rates" subtitle="Additional employee and employer rates."
                                 className="ms-0 mb-2"/>
                        <CardTable
                            data={planModal.benefitAdditionalDetails?.flatMap((item) => ([{
                                label: "Minimum MSC", value: numberWithCommas(Number(item.minMSC)!),
                            }, {
                                label: "Maximum MSC", value: numberWithCommas(Number(item.maxMSC)!),
                            }, {
                                label: "MSC Step", value: numberWithCommas(Number(item.mscStep)!),
                            }, {
                                label: "EC Threshold", value: numberWithCommas(Number(item.ecThreshold)!),
                            }, {
                                label: "Minimum EC", value: `${item.ecLowRate ?? 0}`, // Assuming this is a percentage
                            }, {
                                label: "Maximum EC", value: `${item.ecHighRate ?? 0}`, // Assuming this is a percentage
                            }, {
                                label: "WISP Threshold", value: numberWithCommas(Number(item.wispThreshold)!),
                            },]))!}
                        />

                    </div>}
                    <Divider className="my-2"/>
                    <div>
                        <Section title="Coverage Details" subtitle="Plan coverage details."
                                 className="ms-0 mb-2"/>
                        <div className="text-pretty break-words h-fit">

                            <Typography className="text-sm text-justify indent-5 h-fit"
                                        dangerouslySetInnerHTML={{
                                            __html: boldSurroundedText(planModal.coverageDetails)
                                        }}
                            />
                        </div>
                    </div>
                </>}
                header={<div
                    className="flex flex-col gap-2 h-auto bg-pretty bg-opacity-50 backdrop-blur-sm w-full">
                    <div className="flex items-center gap-5 w-fit">
                        <Typography className="text-2xl font-bold">{planModal.name}</Typography>
                        <Chip style={{
                            background: getColor(planModal.type, 0.2),
                            borderColor: getColor(planModal.type, 0.5),
                            color: getColor(planModal.type)
                        }}
                              variant="bordered" classNames={{
                            content: "font-bold",
                        }}>
                            {planModal.type}
                        </Chip>
                    </div>
                    <div className="text-pretty break-words h-24">
                        <Typography className="text-sm text-justify indent-5 h-fit"
                                    dangerouslySetInnerHTML={{
                                        __html: boldSurroundedText(planModal.description)
                                    }}
                        />
                        {/*<Typography className="text-sm text-justify indent-5 h-[4rem]">*/}
                        {/*    {planModal.description}*/}
                        {/*</Typography>*/}
                    </div>
                </div>}
                // onDanger={
                //     <div className="w-full">{props.current_employees.length > 0 && <Chip className="bg-[#338EF7] text-white min-w-full" radius="sm" startContent={<IoMdInformationCircle className={icon_size_sm}/>}>Note. This leave cannot be edited or deleted.</Chip>}</div>
                // }

                // footer={<>
                //     <Section className="ms-0 mt-4 border-1 rounded p-4" title="Enroll Employee"
                //              subtitle="Enroll employee to this plan">
                //         <Button {...uniformStyle()} onPress={() => setIsOpenEnrolled(true)}>Enroll</Button>
                //     </Section>
                //     <Divider className="mt-4"/>
                // </>}
            />}


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

        {/*<EnrollEmployeeForm plan_id={planModal?.id!} isOpen={isOpenEnrolled} onOpen={setIsOpenEnrolled}/>*/}
        <EditPlanForm plan={planModal} title="Update Plan" description="Update an existing plan"
                      onOpen={setOnEditAndDelete} isOpen={onEditAndDelete}/>

    </section>);
}

export default PlansDataDisplay;