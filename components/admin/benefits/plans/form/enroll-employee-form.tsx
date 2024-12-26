"use client"
import React, {Key, useCallback, useMemo, useState} from 'react';
import FormDrawer from "@/components/common/forms/FormDrawer";
import DataDisplay from "@/components/common/data-display/data-display";
import {useNotEnrolledEmployees} from "@/services/queries";
import {EmployeeDetails} from "@/types/employeee/EmployeeType";
import {Case, Default, Switch} from '@/components/common/Switch';
import {
    Autocomplete,
    AutocompleteItem,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    Selection,
    SelectItem,
    SharedSelection,
    useDisclosure,
    User
} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import Typography from "@/components/common/typography/Typography";
import {axiosInstance} from "@/services/fetcher";
import toast from "react-hot-toast";
import {EmployeeBenefitSelectionDetails} from "@/types/benefits/membership/membership-types";

interface EnrollEmployeeProps {
    isOpen: boolean
    onOpen: (value: boolean) => void
}

interface EnrollEmployeeList extends EmployeeDetails {
    department: string
    job: string
}



function EnrollEmployeeForm({onOpen, isOpen}: EnrollEmployeeProps) {
    const [employee_id, setEmployee_id] = useState<number[]>([])
    const [coverageAmount, setCoverageAmount] = useState<number>(0)
    const [coverageType, setCoverageType] = React.useState<string>("fixed");
    const [isSubmitting, setIsSubmitting] = useState<boolean>()
    const [benefitPlan, setBenefitPlan] = useState<number>()
    const [enrollEmployee, setEnrollEmployee] = useState<EmployeeBenefitSelectionDetails[]>()
    const {onClose, isOpen: isOpenModal, onOpen: onOpenModal, onOpenChange} = useDisclosure()
    // const {toast} = useToast()
    const {
        data, isLoading
    } = useNotEnrolledEmployees()

    const not_enrolled = useMemo(() => {
        if (data) return data
        return null
    }, [data])

    const getEligibleEmployee = useCallback((plan_id: number) => {
            // Find the breakdown for the given plan_id
            const breakdown = not_enrolled?.benefits.find(item => item.id === plan_id)?.contribution_breakdown;

            if (!breakdown) {
                return []; // If no breakdown found, return an empty array
            }

            // Filter employees who are eligible and have not enrolled in the benefit
            const eligibleEmployees = not_enrolled?.employee.filter(employee => {
                const isAlreadyEnrolled = employee.enrolled_benefits_id?.includes(plan_id);

                // Check if employee is not enrolled in the selected benefit and matches the salary range
                return (
                    !isAlreadyEnrolled &&
                    breakdown.some(range => employee.salary >= range.min_salary && employee.salary <= range.max_salary)
                );
            });

            return eligibleEmployees || [];
        },
        [not_enrolled?.benefits, not_enrolled?.employee] // Dependencies
    );


    const selectedPlan = useCallback((value: Key | null) => {
        if (value) {
            const plan_id = Number(value);

            // Find the breakdown of the selected benefit
            // const breakdown = not_enrolled?.benefits.find(item => item.id === plan_id)?.contribution_breakdown!;
            //
            // // Filter employees who are eligible and have not enrolled in the benefit
            // const eligibleEmployees = not_enrolled?.employee.filter(employee => {
            //     const isAlreadyEnrolled = employee.enrolled_benefits_id?.includes(plan_id);
            //
            //     // Check if employee is not enrolled in the selected benefit and matches the salary range
            //     return (!isAlreadyEnrolled && breakdown.some(range => employee.salary >= range.min_salary && employee.salary <= range.max_salary));
            // });
            const eligibleEmployees = getEligibleEmployee(plan_id)
            // Update state
            setEnrollEmployee(eligibleEmployees);
            setBenefitPlan(plan_id);
        }

        if (value === null) {
            setBenefitPlan(undefined);
        }
    }, [getEligibleEmployee]);

    const selectedId = useCallback((values: Selection) => {

        // console.log()
        if (values !== "all" && values.size > 0) {
            setEmployee_id(Array.from(values).map(value => Number(value)))
        } else if (values === "all") {
            const eligibleEmployees = getEligibleEmployee(benefitPlan!)
            setEmployee_id(eligibleEmployees.map(item => item.id))
        } else {
            setEmployee_id([])
        }

    }, [benefitPlan, getEligibleEmployee])

    const handleEnroll = useCallback(async () => {
        const values = {
            plan_id: benefitPlan,
            employee_id, coverageAmount, coverageType: coverageType
        }
        if (coverageAmount >= 0) {
            try {
                setIsSubmitting(true)
                const res = await axiosInstance.post("/api/admin/benefits/plans/enroll/create", values)
                if (res.status === 200) {
                    toast.success("Successfully Enrolled")
                    onOpen(false)
                    onClose()
                    setEmployee_id([])
                    setBenefitPlan(undefined)
                }
            } catch (err) {
                toast.error("Error occurred during enrolling employees")
            } finally {
                setIsSubmitting(false)
            }
            console.log("Enrolled: ", employee_id)
        } else {
            toast.error("Coverage amount is required.")
        }
    }, [benefitPlan, coverageAmount, coverageType, employee_id, onClose, onOpen])
    return (<><FormDrawer title="Enroll Employee"
                          description="Provide the details for enrolling an employee in a new benefit plan."
                          size="md"
                          isOpen={isOpen}
                          onOpen={(value) => {
                              onOpen(value)
                              setBenefitPlan(undefined)
                          }}
                          footer={<div className="w-full flex justify-end">
                              <Button isDisabled={employee_id.length === 0} {...uniformStyle()} onPress={onOpenModal}>
                                  Enroll
                              </Button>
                          </div>}
    >
        {/*<Autocomplete*/}
        {/*    isVirtualized*/}
        {/*    className="max-w-xs"*/}
        {/*    defaultItems={items}*/}
        {/*    label="Search from 10000 items"*/}
        {/*    placeholder="Search..."*/}
        {/*>*/}
        {/*    {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}*/}
        {/*</Autocomplete>*/}
        <div className="space-y-4 h-full overflow-hidden">
            <Autocomplete
                isVirtualized
                radius="sm"
                color="primary"
                variant="bordered"
                defaultItems={not_enrolled?.benefits || []}
                label={<Typography className="font-semibold">Select Benefit Plan <span
                    className="text-danger-500">*</span></Typography>}
                labelPlacement="outside"
                isLoading={isLoading}
                placeholder="Search..."
                onSelectionChange={selectedPlan}
            >
                {(item) => <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>}
            </Autocomplete>
            {benefitPlan && <div className="space-y-2 h-[460px]">
                <Typography className="font-semibold text-sm">Select Employee <span
                    className="text-danger-500">*</span></Typography>
                <DataDisplay
                    title="Not Enrolled"
                    isLoading={isLoading}
                    data={enrollEmployee || []}
                    defaultDisplay="table"
                    searchProps={{
                        searchingItemKey: ["name"]
                    }}
                    paginationProps={{
                        data_length: not_enrolled?.employee.length
                    }}
                    isSelectionDeleted={false}
                    onTableDisplay={{
                        layout: "auto", selectionMode: "multiple", onSelectedKeysChange: selectedId, config: {
                            columns: [{
                                name: "Name", uid: 'name', sortable: true
                            }, {
                                name: "Department", uid: 'department', sortable: true
                            }, {
                                name: "Job", uid: 'job', sortable: true
                            }],

                            rowCell: (item: EnrollEmployeeList, columnKey: React.Key) => {
                                const key = columnKey as keyof EnrollEmployeeList
                                const cellValue = item[key]
                                return (<Switch expression={String(key)}>
                                    <Case of="name">
                                        <User
                                            name={item.name}
                                            avatarProps={{
                                                src: item.picture
                                            }}
                                        />
                                    </Case>
                                    <Default>
                                        <Typography>{String(cellValue)}</Typography>
                                    </Default>
                                </Switch>)
                            }

                        }

                    }}

                /></div>}
        </div>
    </FormDrawer>
        <Modal isOpen={isOpenModal} onOpenChange={onOpenChange} isDismissable={false}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">Add Coverage Amount</ModalHeader>
                <ModalBody>
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
    </>);
}

export default EnrollEmployeeForm;

