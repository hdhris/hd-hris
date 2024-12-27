"use client"

import {isEqual} from "lodash";
import {Button} from "@nextui-org/button";
import {axiosInstance} from "@/services/fetcher";
import showDialog from "@/lib/utils/confirmDialog";
import {useToast} from '@/components/ui/use-toast';
import {useBenefitMembership, useNotEnrolledEmployees} from "@/services/queries";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import CardView from "@/components/common/card-view/card-view";
import DataDisplay from "@/components/common/data-display/data-display";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import React, {Key, useCallback, useEffect, useMemo, useState} from 'react';
import {EmployeeBenefitDetails, PaginatedEmployeeBenefitDetails} from "@/types/benefits/membership/membership-types";
import {FilterItems} from "@/components/admin/leaves/table-config/approval-tables-configuration";
import Typography, {Section} from "@/components/common/typography/Typography";
import {MembersBenefitTable} from "@/components/admin/benefits/membership/membership-table-config";
import UserMail from "@/components/common/avatar/user-info-mail";
import CardTable from "@/components/common/card-view/card-table";
import BorderCard from "@/components/common/BorderCard";
import {toGMT8} from "@/lib/utils/toGMT8";
import {capitalize} from "@nextui-org/shared-utils";
import NumberFlow from "@number-flow/react";
import EnrollEmployeeForm from "@/components/admin/benefits/plans/form/enroll-employee-form";
import {LuPlus, LuTrash2} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";
import {
    Autocomplete,
    AutocompleteItem,
    cn,
    Input, Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    SharedSelection, useDisclosure
} from "@nextui-org/react";
import {Chip} from "@nextui-org/chip";
import toast from "react-hot-toast";

function PlansDataDisplay() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [selectedMember, setSelectedMember] = useState<EmployeeBenefitDetails>()
    const {onClose, isOpen: isOpenModal, onOpen: onOpenModal, onOpenChange} = useDisclosure()
    const [coverageType, setCoverageType] = React.useState<string>("fixed");
    const [coverageAmount, setCoverageAmount] = useState<number>(0)
    const [selectedPlan, setSelectedPlan] = useState<number>()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const {
        data:benefitsSelection, isLoading: benefitsSelectionIsLoading
    } = useNotEnrolledEmployees()
    const onOpenDrawer = useCallback(() => {
        setIsOpen(true)
    }, [setIsOpen])

    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)

    const {data, isLoading} = useBenefitMembership({page, rows});
    const members = useMemo<PaginatedEmployeeBenefitDetails | null>(() => {
        if (data) {
            return data
        }
        return null
        // return []
    }, [data])

    const navEndContent = useCallback(() => {
        return (<>
            <Button {...uniformStyle()} onPress={onOpenDrawer}>Enroll Employee</Button>
            {/*<PlanForm onOpen={setIsOpen} isOpen={isOpen}/>*/}
            <EnrollEmployeeForm isOpen={isOpen} onOpen={setIsOpen}/>
        </>)
    }, [onOpenDrawer, isOpen]);

    SetNavEndContent(navEndContent)



    useEffect(() => {
        const id = selectedMember?.id
        if (!isEqual(members?.membership, selectedMember)) {
            setSelectedMember(members?.membership.find((item) => item.id === id))
        }
    }, [members, selectedMember]);

    const handleEmployeeSelection = (id: Key) => {
        setSelectedMember(members?.membership.find(item => item.id === Number(id)))


    }


    const handleDeletePlan = async (key: number | string, name: string) => {
        const res = await showDialog({
            title: "Delete Confirmation",
            message: <Typography>Do you want to delete <span className="font-semibold">{name}</span> plan? This process
                can&apos;t be undone.</Typography>
        });


        if (res === "yes") {
            // Store the previous state in case we need to revert it
            try {
                const response = await axiosInstance.post("/api/admin/benefits/membership/delete-membership", {id: key});

                if (response.status === 200) {
                    toast.success(`${name} has been deleted successfully.`);
                }
            } catch (error) {
                // Revert the state if an error occurs

                // Display an error message to the user
                toast.error(`Failed to delete ${name}. Please try again.`);
                console.error("Termination error:", error);
            }
        }
    }

    const handleEnroll = useCallback(async () => {
        const values = {
            plan_id: selectedPlan,
            employee_id: [selectedMember?.id], coverageAmount, coverageType: coverageType
        }
        if (coverageAmount >= 0) {
            try {
                setIsSubmitting(true)
                const res = await axiosInstance.post("/api/admin/benefits/plans/enroll/create", values)
                if (res.status === 200) {
                    toast.success("Successfully Enrolled")
                    onClose()
                    setSelectedPlan(undefined)
                }
            } catch (err) {
                toast.error("Error occurred during enrolling employees")
            } finally {
                setIsSubmitting(false)
            }
        } else {
            toast.error("Coverage amount is required.")
        }
    },[coverageAmount, coverageType, onClose, selectedMember?.id, selectedPlan])
    // }, [onEditAndDelete, planModal]);
    return (<section className='h-full flex gap-4'>
        <DataDisplay
            isLoading={isLoading}
            defaultDisplay="table"
            data={members?.membership || []}
            title="Benefit Plan Membership"
            filterProps={{
                filterItems: FilterItems
            }}
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
                loop: true, data_length: data?.total!, onChange: setPage
            }}
            onTableDisplay={{
                config: MembersBenefitTable, onRowAction: handleEmployeeSelection,
            }}
            onView={selectedMember && <CardView
                className="w-[450px]"
                title="Memeber"
                onClose={() => setSelectedMember(undefined)}
                header={<UserMail
                    name={<div className="flex gap-10">
                        <Typography className="font-semibold">{selectedMember.name}</Typography>
                    </div>}
                    picture={selectedMember.picture!}
                    email={selectedMember.email || "No Email"}
                />}
                body={<>
                    <Section
                        className="ms-0"
                        title="You Benefit Plan Details"
                        subtitle="Comprehensive information about your benefits"
                    >
                        <Button startContent={<LuPlus/>} {...uniformStyle()} onPress={() => {
                            onOpenModal()
                            console.log("Benefit: ", benefitsSelection)
                            console.log("Selected Em: ", selectedMember)
                            // const filteredPlan = benefitsSelection?.benefits.filter(plan => {
                            //     // Exclude benefits already active for the employee
                            //     const isNotActive = selectedMember?.employee_benefits.every(selectedBenefit =>
                            //         selectedBenefit.benefit_plans.id !== plan.id || capitalize(selectedBenefit.status) !== "Active"
                            //     );
                            //
                            //     // Check if the employee's salary grade falls within any contribution breakdown range
                            //     const isInSalaryRange = plan.contribution_breakdown.some(cb =>
                            //         selectedMember?.salary_grade! >= cb.min_salary && selectedMember?.salary_grade! <= cb.max_salary
                            //     );
                            //
                            //     // Return plans that meet both criteria
                            //     return isNotActive && isInSalaryRange;
                            // });


                            // console.log("Filtered: ", filteredPlan)
                        }}>Add Plan</Button>
                    </Section>
                    {selectedMember.employee_benefits.map(member => {

                        return (<BorderCard key={member.id}
                                            heading={member.benefit_plans.name}
                                            subHeading={member.benefit_plans.type}
                                            classNames={{
                                                container: member.status === "Terminated" ? "border-danger-500" : "border-success-500",
                                                heading: "text-sm", subHeading: "font-semibold !text-default-400/80"
                                            }}
                                            endContent={member.status === "Active" && <Button {...uniformStyle({color: "danger", variant: "light"})}
                                                                isIconOnly
                                                                onPress={() => handleDeletePlan(member.id, member.benefit_plans.name)}><LuTrash2
                                                className={cn("text-danger-500", icon_size_sm)}/></Button>}
                            >
                                <CardTable
                                    data={[{
                                        label: "Enrollment Date",
                                        value: toGMT8(member.enrollment_date).format("MMM DD, YYYY")
                                    }, {
                                        label: "Benefit Plan Name", value: member.benefit_plans.name
                                    }, {
                                        label: "Benefit Plan Type", value: member.benefit_plans.type
                                    }, {
                                        label: "Benefit Plan Validity",
                                        value: `${toGMT8(member.benefit_plans.effectiveDate).format("MMM DD, YYYY")} - ${toGMT8(member.benefit_plans.expirationDate).format("MMM DD, YYYY")}`
                                    }, {
                                        label: member.contributions.contribution_type !== "others" ? `Benefit Amount ${member.contributions.contribution_type === "fixed" ? "(₱)" : "(%)"}` : "Benefit Rate (%)",
                                        value: <NumberFlow
                                            value={member.contributions.contribution_type !== "others" ? member.contributions.actual_contribution_amount ?? 0 : member.contributions.employee_rate}/>
                                    }, {
                                        label: "Contribution Amount (₱)",
                                        value: <NumberFlow value={member.contribution_amount}/>
                                    }, {
                                        label: "Contribution Type",
                                        value: capitalize(member.contributions.contribution_type)
                                    }, {
                                        label: "Coverage Type", value: capitalize(member.coverage_amount_type as string)
                                    }, {
                                        label: "Coverage Amount", value: <NumberFlow value={member.coverage_amount}/>
                                    }, {
                                        label: "Status",
                                        value: <Chip
                                            className="border-none"
                                            variant="dot"
                                            color={member.status === "Active" ? "success" : "danger"}>{member.status}</Chip>
                                    }, ...(member.terminated_at !== null ? [{
                                        label: "Terminated Date", value: toGMT8(member.terminated_at).format("MMM DD, YYYY"),
                                    },] : []),]}
                                />
                            </BorderCard>

                        )
                    })
                    }

                </>}
            />}
        />
        <Modal isOpen={isOpenModal} onOpenChange={onOpenChange} isDismissable={false}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">Add Benefit Plan</ModalHeader>
                <ModalBody>
                    <Autocomplete
                        isVirtualized
                        radius="sm"
                        color="primary"
                        variant="bordered"
                        defaultItems={benefitsSelection?.benefits.filter(plan => {
                            // Exclude benefits already active for the employee
                            const isNotActive = selectedMember?.employee_benefits.every(selectedBenefit =>
                                selectedBenefit.benefit_plans.id !== plan.id || capitalize(selectedBenefit.status) !== "Active"
                            );

                            // Check if the employee's salary grade falls within any contribution breakdown range
                            const isInSalaryRange = plan.contribution_breakdown.some(cb =>
                                selectedMember?.salary_grade! >= cb.min_salary && selectedMember?.salary_grade! <= cb.max_salary
                            );

                            // Return plans that meet both criteria
                            return isNotActive && isInSalaryRange;
                        })}
                        label={<Typography className="font-semibold">Select Benefit Plan <span
                            className="text-danger-500">*</span></Typography>}
                        labelPlacement="outside"
                        isLoading={benefitsSelectionIsLoading}
                        placeholder="Search..."
                        onSelectionChange={(value) => {
                            if(value) {
                                setSelectedPlan(Number(value))

                                // const activeBenefitIds = new Set(
                                //     selectedMember?.employee_benefits
                                //         .filter(eb => eb.status === "Active" || eb.status === "Terminated")
                                //         .map(eb => eb.benefit_plans.id)
                                // );
                                //
                                // const ben = benefitsSelection?.benefits.filter(benefit => {
                                //     // Exclude already used benefits
                                //     if (activeBenefitIds.has(benefit.id)) {
                                //         return false;
                                //     }
                                //
                                //     // Check salary range
                                //     return benefit.
                                //     contribution_breakdown.some(cb =>
                                //         selectedMember?.salary_grade! >= cb.min_salary && selectedMember?.salary_grade! <= cb.max_salary
                                //     );
                                // });

                                const employee_salary = selectedMember?.salary_grade!
                                // console.log("Benefit Id: ", ben)
                                // console.log("Benefit: ", benefitsSelection)
                                // console.log("Selected Em: ", selectedMember)
                                // const benefits = benefitsSelection?.benefits.filter(item => item.contribution_breakdown.some(range => employee_salary >= range.min_salary && employee_salary <= range.max_salary))
                                // console.log("Test: ", benefitsSelection?.benefits.filter(item => selectedMember?.employee_benefits.some(id => id.benefit_plans.id !== item.id)))
                            }
                        }}
                    >
                        {(item) => <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>}
                    </Autocomplete>
                    <Select
                        disallowEmptySelection
                        color="primary"
                        label={<Typography className="font-semibold">Coverage Type</Typography>}
                        labelPlacement="outside"
                        variant="bordered"
                        radius="sm"
                        description={<Typography className="text-sm font-medium !text-default-400">Select the coverage
                            type</Typography>}
                        defaultSelectedKeys={["fixed"]}
                        onSelectionChange={(value: SharedSelection) => setCoverageType(value.currentKey as "fixed" | "percentage")}
                    >
                        <SelectItem key="fixed">Fixed</SelectItem>
                        <SelectItem key="percentage">Percentage</SelectItem>
                    </Select>
                    <Input
                        color="primary"
                        variant="bordered"
                        size="md"
                        radius="sm"
                        label={<Typography className="font-semibold">Coverage Amount</Typography>}
                        labelPlacement="outside"
                        disableAnimation
                        placeholder="Enter the coverage amount for the employee"
                        type="number"
                        description={<Typography className="text-sm font-medium !text-default-400">Enter the coverage
                            amount for the employee</Typography>}
                        onValueChange={(value) => setCoverageAmount(Number(value))}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button {...uniformStyle()} isLoading={isSubmitting} onPress={handleEnroll}>
                        Add
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </section>);
}

export default PlansDataDisplay;