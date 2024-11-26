"use client"
import React, {useMemo, useState} from 'react';
import FormDrawer from "@/components/common/forms/FormDrawer";
import DataDisplay from "@/components/common/data-display/data-display";
import {useQuery} from "@/services/queries";
import {EmployeeDetails} from "@/types/employeee/EmployeeType";
import {Case, Default, Switch} from '@/components/common/Switch';
import {User} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {useToast} from "@/components/ui/use-toast";
import {axiosInstance} from "@/services/fetcher";

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
    const [isSubmitting, setIsSubmitting] = useState<boolean>()
    const {toast} = useToast()
    const {
        data, isLoading
    } = useQuery<EnrollEmployeeList[]>('/api/admin/benefits/plans/not-enrolled?plan_id=' + plan_id)

    const not_enrolled = useMemo(() => {
        if (data) return data
        return []
    }, [data])

    const handleEnroll = async () => {
        const values = {
            plan_id,
            employee_id
        }
        try{
            setIsSubmitting(true)
            const res =  await axiosInstance.post("/api/admin/benefits/plans/enroll/create", values)
            if(res.status === 200){
                toast({
                    title: "Success",
                    description: "Successfully Enrolled",
                    variant: "success"
                })
            }
        } catch (err){
            toast({
                title: "Error",
                description: "Error occured during enrolling employees",
                variant: "danger"
            })
        } finally {
            setIsSubmitting(false)
        }
        console.log("Enrolled: ", employee_id)
    }
    return (<FormDrawer title="Enroll Employee"
                        size="md"
                        description="Provide the details for enrolling an employee in a new benefit plan."
                        isOpen={isOpen}
                        onOpen={onOpen}
                        footer={<div className="w-full flex justify-end">
                            <Button isLoading={isSubmitting} {...uniformStyle()} onClick={handleEnroll}>
                                Enroll
                            </Button>
                        </div>}
        >
            <DataDisplay
                title="Not Enrolled"
                isLoading={isLoading}
                data={not_enrolled}
                defaultDisplay="table"
                paginationProps={{
                    data_length: not_enrolled.length
                }}
                searchProps={{
                    searchingItemKey: ["name"]
                }}
                isSelectionDeleted={false}
                onTableDisplay={{
                    layout: "auto", selectionMode: "multiple",
                    onSelectionChange: (values) => {
                       if(values !== "all" && values.size > 0) {
                           setEmployee_id(Array.from(values).map(value => Number(value)))
                       } else {
                           setEmployee_id(not_enrolled.map(id => Number(id.id)))
                       }
                    }, config: {
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

    );
}

export default EnrollEmployeeForm;