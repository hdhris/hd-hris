"use client"

import React, {useCallback, useMemo, useState} from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {FilterItems} from "@/components/admin/leaves/table-config/approval-tables-configuration";
import DataDisplay from "@/components/common/data-display/data-display";
import {usePaginateQuery} from "@/services/queries";
import {Card, Modal, ModalBody, ModalContent, ModalFooter, useDisclosure} from "@nextui-org/react";
import {CardBody, CardHeader} from "@nextui-org/card";
import Typography from "@/components/common/typography/Typography";
import {Chip} from "@nextui-org/chip";
import BenefitPlanForm from "@/components/admin/benefits/plans/form/benefit-plan-form";
import {BenefitPlanPaginated} from "@/types/benefits/plans/plansTypes";
import {bgColor} from "@/helper/background-color-generator/generator";
import PlanDetails from "@/components/admin/benefits/plans/plan-details";

function PlansDataDisplay() {
    // const TypeIcon = ({ type }: { type: any }) => {
    //     const Icon = typeIcons[type] || AlertCircle
    //     return <Icon className="w-5 h-5" />
    // }
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const {isOpen: isModalOpen, onOpen, onOpenChange} = useDisclosure();
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
    SetNavEndContent(() => {

        return (<>
            <Button {...uniformStyle()} onClick={onOpenDrawer}>
                Add New Plan
            </Button>
            <BenefitPlanForm onOpen={setIsOpen} isOpen={isOpen}/>
        </>)
    })
    return (<DataDisplay
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
        onGridDisplay={(plan) => {
            return (<Card className="w-[270px] h-[250px] border-2" shadow="none" style={{
                borderColor: plan.isActive ? "#17c964" : "#f31260"
            }} isPressable isHoverable isBlurred>
                <CardHeader className="flex-col items-start">
                    <Typography className="flex items-center gap-2 font-semibold">
                        {plan.name}
                    </Typography>
                    <Typography className="text-sm !text-default-400/75 text-justify">{plan.description}</Typography>
                </CardHeader>
                <CardBody className="flex flex-col justify-between">
                    <Chip classNames={{
                        content: "font-medium"
                    }} className="mb-2" {...bgColor(plan.type, 0.5)}>{plan.type}</Chip>
                    <Typography className="text-sm mb-2 truncate break-normal">{plan.coverageDetails}</Typography>
                    <div className="flex justify-between items-center mt-4">
                        <Button variant="bordered" size="sm" onPress={onOpen}>
                            View Details
                        </Button>

                        <Modal isOpen={isModalOpen} onOpenChange={onOpenChange} isDismissable={false}
                               isKeyboardDismissDisabled={true}>
                            <ModalContent>
                                {(onClose) => (<>
                                        <ModalBody>
                                            <PlanDetails {...plan}/>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="danger" variant="light" onPress={onClose}>
                                                Close
                                            </Button>
                                        </ModalFooter>
                                    </>)}
                            </ModalContent>
                        </Modal>
                        <div className="text-xs text-muted-foreground">
                            {plan.effectiveDate} - {plan.expirationDate}
                        </div>
                    </div>
                </CardBody>
            </Card>)
        }}
    />);
}

export default PlansDataDisplay;