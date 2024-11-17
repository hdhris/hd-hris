"use client";
import CardForm from "@/components/common/forms/CardForm";
import FormFields from "@/components/common/forms/FormFields";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { switchLabel } from "../attendance-time/holidays/script";
import { useQuery } from "@/services/queries";
import { PayheadAffected } from "@/types/payroll/payheadType";
import PayheadCalculator from "./Calculator/Calculator";
import { Spinner, Input, cn } from "@nextui-org/react";
import { capitalize } from "lodash";
import { ListDropDown } from "./ListBoxDropDown";
import { UserEmployee } from "@/helper/include-emp-and-reviewr/include";
import UserMail from "@/components/common/avatar/user-info-mail";
import { getEmpFullName } from "@/lib/utils/nameFormatter";

function PayheadUpsert({ payhead_id, payhead_type }: { payhead_id?: string; payhead_type?: string }) {
    const { data: payheadAffected, isLoading } = useQuery<PayheadAffected>(
        `/api/admin/payroll/payhead/read?id=${payhead_id}`
    );
    const [filteredEmployees, setFilteredEmployees] = useState<UserEmployee[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(new Set());
    const [amountRecords, setAmountRecords] = useState<{ employee_id: number; amount: number }[]>([]);
    const [isMandatory, setIsMandatory] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            calculation: "",
            is_active: true,
            is_overwritable: true,
            variable: "",
            name: "New",
            affected_json: {
                mandatory: { probationary: false, regular: false },
                departments: [],
                job_classes: [],
                employees: [],
            },
        },
        values: payheadAffected?.payhead,
    });

    function updateAmountRecords(employee_id: number, amount: number) {
        if (amount > 0) {
            setAmountRecords(prev => {
                const exists = prev.some(item => item.employee_id === employee_id);
                if (exists) {
                    return prev.map(item => (item.employee_id === employee_id ? { ...item, amount } : item));
                } else {
                    return [...prev, { employee_id, amount }];
                }
            });
        } else {
            setAmountRecords((prev) => prev.filter((prv) => prv.employee_id != employee_id));
        }
    }
    const getAmountRecords = useCallback(
        (employee_id: number): string => {
            const value =  String(amountRecords.find((ar) => ar.employee_id === employee_id)?.amount || "");
            return value;
        },
        [amountRecords]
    );

    const selectEmployee = useCallback(
        (id: number) => {
            setSelectedEmployees((prev) => {
                const updated = new Set(prev);
                if (updated.has(id)) {
                    updated.delete(id);
                } else {
                    updated.add(id);
                }
                return updated;
            });
        },
        [selectedEmployees]
    );

    const handleSubmit = useCallback(async(value: z.infer<typeof formSchema>)=>{
        if(isMandatory)
            value.affected_json.employees = [] // Automatically involve every employees
        else
            value.affected_json.employees = [...selectedEmployees]

        if(value.affected_json.departments.length === payheadAffected?.departments.length)
            value.affected_json.departments = [] // Automatically involve every departments

        if(value.affected_json.job_classes.length === payheadAffected?.job_classes.length)
            value.affected_json.job_classes = [] // Automatically involve every job/roles
        
        console.log(value, amountRecords);
    },[amountRecords, selectedEmployees, payheadAffected])

    const filterEmployees = useCallback(
        (employees: UserEmployee[]) => {
            if (employees && form) {
                const mandatory = form.getValues("affected_json.mandatory");
                setIsMandatory(mandatory.probationary || mandatory.regular);
                setFilteredEmployees(
                    employees?.filter((emp) => {
                        if (mandatory.regular && mandatory.probationary) return true;
                        if (mandatory.regular) return emp.is_regular;
                        if (mandatory.probationary) return !emp.is_regular;

                        return true;
                    })
                );
            }
        },
        [form]
    );

    useEffect(() => {
        // On load
        if (payheadAffected) filterEmployees(payheadAffected.employees);
    }, [payheadAffected]);

    if (isLoading) {
        return <Spinner label="Loading..." className="flex-1" />;
    }
    return (
        <div className="h-full w-full flex gap-2">
            <CardForm
                label={payheadAffected?.payhead ? "Update" : "Create"}
                form={form}
                onSubmit={handleSubmit}
                className="w-fit"
                classNames={{ body: { form: "space-y-4" } }}
            >
                <FormFields
                    items={[
                        {
                            name: "name",
                            label: "Name",
                            isRequired: true,
                        },
                        {
                            name: "calculation",
                            label: "Calculation",
                            Component: (field) => {
                                return (
                                    <PayheadCalculator
                                        payhead={payheadAffected?.payhead}
                                        setInvalid={setIsInvalid}
                                        input={field.value}
                                        setInput={field.onChange}
                                    />
                                );
                            },
                        },
                        {
                            name: "is_overwritable",
                            type: "switch",
                            label: switchLabel("Writable", `Amount can be overwritten over given calculated input`),
                        },
                        {
                            name: "is_active",
                            type: "switch",
                            label: switchLabel(
                                "Active",
                                `${capitalize(payhead_type)} will be effective on next payroll`
                            ),
                        },
                        {
                            name: "affected_json.mandatory",
                            Component: (field) => (
                                <ListDropDown
                                    items={[
                                        { name: "Probationary", id: 1 },
                                        { name: "Regular", id: 2 },
                                    ]}
                                    triggerName="Mandatory Status"
                                    selectedKeys={
                                        new Set(
                                            [
                                                field?.value?.probationary ? 1 : undefined,
                                                field?.value?.regular ? 1 : undefined,
                                            ].filter((key) => key !== undefined)
                                        )
                                    }
                                    onSelectionChange={(keys) => {
                                        const values = Array.from(keys);
                                        field.onChange({
                                            probationary: values.includes("1"),
                                            regular: values.includes("2"),
                                        });
                                        filterEmployees(payheadAffected?.employees || []);
                                    }}
                                    togglable={true}
                                    reversable={true}
                                />
                            ),
                        },
                        {
                            name: "affected_json.departments",
                            Component: (field) => (
                                <ListDropDown
                                    items={payheadAffected?.departments || []}
                                    triggerName="Departments"
                                    selectedKeys={new Set(field.value)}
                                    onSelectionChange={(keys) => {
                                        field.onChange(Array.from(keys));
                                    }}
                                    togglable={true}
                                    reversable={true}
                                />
                            ),
                        },
                        {
                            name: "affected_json.job_classes",
                            Component: (field) => (
                                <ListDropDown
                                    items={
                                        payheadAffected?.job_classes.filter((job) => {
                                            return form
                                                .getValues("affected_json.departments")
                                                ?.map(Number)
                                                ?.includes(job.department_id);
                                        }) || []
                                    }
                                    triggerName="Roles"
                                    selectedKeys={new Set(field.value)}
                                    onSelectionChange={(keys) => {
                                        field.onChange(Array.from(keys).map(Number));
                                    }}
                                    togglable={true}
                                    reversable={true}
                                    sectionConfig={payheadAffected?.departments
                                        .map((dep) => {
                                            return {
                                                name: dep.name,
                                                key: "department_id",
                                                id: dep.id,
                                            };
                                        })
                                        .filter((dep) => {
                                            return form.getValues("affected_json.departments")?.includes(dep.id);
                                        })}
                                />
                            ),
                        },
                        {
                            name: "variable",
                            label: "Variable ( intended for reusability )",
                            isRequired: false,
                        },
                    ]}
                />
            </CardForm>
            <div className="w-full h-full overflow-auto ">
                <div className="min-w-[750px] space-y-1 h-fit">
                    {filteredEmployees.map((item: UserEmployee) => (
                        <div
                            key={item.id}
                            className={cn(
                                "p-4 border-2 cursor-pointer",
                                isMandatory
                                    ? "border-gray-50"
                                    : selectedEmployees.has(item.id)
                                    ? "border-blue-500"
                                    : "border-gray-50"
                            )}
                        >
                            <div className="flex flex-row gap-4">
                                <div className="flex-1">
                                    <UserMail
                                        name={getEmpFullName(item)}
                                        picture={item.picture}
                                        email={item.email}
                                        onClick={() => selectEmployee(item.id)}
                                    />
                                </div>
                                <div className="w-48 text-small">
                                    <p>{item.ref_job_classes ? item.ref_job_classes.name : "None"}</p>
                                    <p className=" text-gray-500">
                                        {item.ref_departments ? item.ref_departments.name : "None"}
                                    </p>
                                </div>
                                <Input
                                    variant="bordered"
                                    type="number"
                                    className="w-20"
                                    value={getAmountRecords(item.id)}
                                    onValueChange={(value) => updateAmountRecords(item.id, Number(value))}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PayheadUpsert;

const formSchema = z.object({
    name: z
        .string()
        .min(3, { message: "Name must be at least 3 characters." })
        .max(20, { message: "Name cannot exceed 20 characterd." }),
    calculation: z.string().optional(),
    is_active: z.boolean(),
    is_overwritable: z.boolean().optional(),
    variable: z.string().max(14).optional(),
    affected_json: z.object({
        mandatory: z.object({
            probationary: z.boolean(),
            regular: z.boolean(),
        }),
        departments: z.array(z.number()),
        job_classes: z.array(z.number()),
        employees: z.array(z.number()),
    }),
});
