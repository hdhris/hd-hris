"use client"

import React, {Key, useCallback, useEffect, useMemo, useState} from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {FilterItems} from "@/components/admin/leaves/table-config/approval-tables-configuration";
import DataDisplay from "@/components/common/data-display/data-display";
import {usePaginateQuery} from "@/services/queries";
import {Card, useDisclosure} from "@nextui-org/react";
import {CardBody, CardHeader} from "@nextui-org/card";
import Typography from "@/components/common/typography/Typography";
import BenefitPlanForm from "@/components/admin/benefits/plans/form/benefit-plan-form";
import {BenefitPlan, BenefitPlanPaginated} from "@/types/benefits/plans/plansTypes";
import PlanDetails from "@/components/admin/benefits/plans/plan-details";
import PlanTypeChip from "@/components/admin/benefits/plans/plan-type-chip";
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from "@/components/ui/context-menu";

function PlansDataDisplay() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [onEditAndDelete, setOnEditAndDelete] = useState<boolean>(false)
    const [planModal, setPlanModal] = useState<BenefitPlan>()
    const onOpenDrawer = useCallback(() => {
        setIsOpen(true)
    }, [setIsOpen])

    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)

    const {data, isLoading} = usePaginateQuery<BenefitPlanPaginated>("/api/admin/benefits/plans", page, rows, {
        refreshInterval: 3000
    });
    const benefitPlans = useMemo(() => {
        if (data) return data.data
        return []
    }, [data])

    const navEndContent = useCallback(() => {
        console.log("Rendered")
        return(
            <>
                <Button {...uniformStyle()} onClick={onOpenDrawer}>
                    Add New Plan
                </Button>
                <BenefitPlanForm onOpen={setIsOpen} isOpen={isOpen}/>
            </>
        )
    }, [onOpenDrawer, isOpen]);

    SetNavEndContent(navEndContent)


    const handlePlanSelection = (id: Key) => {
        setPlanModal(benefitPlans.find(item => item.id === id))
    }
    const handlePlanOnEditAndDelete = useCallback((id: Key) => {
        setPlanModal(benefitPlans.find(item => item.id === id))
    }, [benefitPlans])

    // useEffect(() => {
    //     if (!onEditAndDelete && planModal) {
    //         setOnEditAndDelete(true)
    //     }
    // }, [onEditAndDelete, planModal]);
    return (<section className='h-full flex gap-4'>
        <DataDisplay
            isLoading={isLoading}
            defaultDisplay="grid"
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
            // onListDisplay={(data) => {
            //     return (<BorderCard>{data.name}</BorderCard>)
            // }}
            onGridDisplay={(plan, key) => {
                return (<ContextMenu>
                    <ContextMenuTrigger>
                    <Card className="w-[270px] h-[250px] border-2" shadow="none" style={{
                        borderColor: plan.isActive ? "#17c964" : "#f31260"
                    }} isHoverable>
                        <CardHeader className="flex-col items-start">
                            <Typography className="flex items-center gap-2 font-semibold">
                                {plan.name}
                            </Typography>
                            <Typography
                                className="text-sm !text-default-400/75 text-justify">{plan.description}</Typography>
                        </CardHeader>
                        <CardBody className="flex flex-col justify-between">
                            <PlanTypeChip type={plan.type}/>
                            <Typography
                                className="text-sm mb-2 truncate break-normal">{plan.coverageDetails}</Typography>
                            <div className="flex justify-between items-center mt-4">
                                <Button variant="bordered" size="sm" onClick={() => handlePlanSelection(key)}>
                                    View Details
                                </Button>
                                {/*<Modal isOpen={isModalOpen} onOpenChange={onOpenChange} isDismissable={false}*/}
                                {/*       isKeyboardDismissDisabled={true}>*/}
                                {/*    <ModalContent>*/}
                                {/*        <ModalBody className="py-10">*/}
                                {/*            <PlanDetails {...planModal!}/>*/}
                                {/*        </ModalBody>*/}
                                {/*    </ModalContent>*/}
                                {/*</Modal>*/}
                                <div className="text-xs text-muted-foreground">
                                    {plan.effectiveDate} - {plan.expirationDate}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem onClick={() => {
                            handlePlanOnEditAndDelete(key)
                            setOnEditAndDelete(true)
                        }}>Edit</ContextMenuItem>
                        <ContextMenuItem>Delete</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>)
            }}
        />
        {planModal && <PlanDetails {...planModal!}/>}
        <BenefitPlanForm plan={planModal} title="Update Plan" description="Update an existing plan" onOpen={setOnEditAndDelete} isOpen={onEditAndDelete}/>

    </section>);
}

export default PlansDataDisplay;