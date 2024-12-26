"use client"
import React, {useCallback, useMemo, useState} from 'react';
import FormDrawer from "@/components/common/forms/FormDrawer";
import DataDisplay from "@/components/common/data-display/data-display";
import {useQuery} from "@/services/queries";
import {EmployeeDetails} from "@/types/employeee/EmployeeType";
import {Case, Default, Switch} from '@/components/common/Switch';
import {
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select, SelectItem,
    useDisclosure,
    User,
    Selection, SharedSelection
} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {useToast} from "@/components/ui/use-toast";
import Typography from "@/components/common/typography/Typography";
import {axiosInstance} from "@/services/fetcher";
import toast from "react-hot-toast";

interface EnrollEmployeeProps {
    plan_id: number
    isOpen: boolean
    onOpen: (value: boolean) => void
}

interface EnrollEmployeeList extends EmployeeDetails {
    department: string
    job: string
}

function EnrollEmployeeForm({plan_id, onOpen, isOpen}: EnrollEmployeeProps) {
    const [employee_id, setEmployee_id] = useState<number[]>([])
    const [coverageAmount, setCoverageAmount] = useState<number>(0)
    const [coverageType, setCoverageType] = React.useState<string>("fixed");
    const [isSubmitting, setIsSubmitting] = useState<boolean>()
    const {onClose, isOpen: isOpenModal, onOpen: onOpenModal, onOpenChange} = useDisclosure()
    // const {toast} = useToast()
    const {
        data, isLoading
    } = useQuery<EnrollEmployeeList[]>('/api/admin/benefits/plans/not-enrolled?plan_id=' + plan_id)

    const not_enrolled = useMemo(() => {
        if (data) return data
        return []
    }, [data])


    const handleEnroll = useCallback(async () => {
        const values = {
            plan_id, employee_id,
            coverageAmount,
            coverageType: coverageType
        }
        if(coverageAmount >= 0){
            try {
                setIsSubmitting(true)
                const res = await axiosInstance.post("/api/admin/benefits/plans/enroll/create", values)
                if (res.status === 200) {
                    toast.success("Successfully Enrolled")
                    onOpen(false)
                    onClose()
                    setEmployee_id([])
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
    }, [coverageAmount, coverageType, employee_id, onClose, onOpen, plan_id])
    return (<><FormDrawer title="Enroll Employee"
                          size="md"
                          description="Provide the details for enrolling an employee in a new benefit plan."
                          isOpen={isOpen}
                          onOpen={onOpen}
                          footer={<div className="w-full flex justify-end">
                              <Button isDisabled={employee_id.length === 0} {...uniformStyle()} onPress={onOpenModal}>
                                  Enroll
                              </Button>
                          </div>}
    >
        <DataDisplay
            title="Not Enrolled"
            isLoading={isLoading}
            data={not_enrolled}
            defaultDisplay="table"
            // paginationProps={{
            //     data_length: not_enrolled.length
            // }}

            searchProps={{
                searchingItemKey: ["name"]
            }}
            isSelectionDeleted={false}
            onTableDisplay={{
                layout: "auto", selectionMode: "multiple",
                onSelectedKeysChange: (values) => {
                   if(values !== "all" && values.size > 0) {
                       setEmployee_id(Array.from(values).map(value => Number(value)))
                   } else {
                       setEmployee_id(not_enrolled.map(id => Number(id.id)))
                   }
                },
                config: {
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
                                {String(cellValue)}
                            </Default>
                        </Switch>)
                    }

                }

            }}

        />
    </FormDrawer>
        <Modal isOpen={isOpenModal} onOpenChange={onOpenChange} isDismissable={false}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">Add Coverage Amount</ModalHeader>
                <ModalBody>
                    <Select
                        disallowEmptySelection
                        color="primary"
                        label={<Typography className="text-medium font-medium">Coverage Type</Typography>}
                        labelPlacement="outside"
                        variant="bordered"
                        radius="sm"
                        description={<Typography className="text-sm font-medium !text-default-400">Select the coverage type</Typography>}
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
                        label={<Typography className="text-medium font-medium">Coverage Amount</Typography>}
                        labelPlacement="outside"
                        disableAnimation
                        placeholder="Enter the coverage amount for the employee"
                        type="number"
                        description={<Typography className="text-sm font-medium !text-default-400">Enter the coverage amount for the employee</Typography>}
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

