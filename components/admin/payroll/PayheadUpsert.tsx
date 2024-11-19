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
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import SearchFilter from "@/components/common/filter/SearchFilter";
import { useRouter } from "next/navigation";
import { static_formula } from "@/helper/payroll/calculations";

function PayheadUpsert({ payhead_id, payhead_type }: { payhead_id?: string; payhead_type?: string }) {
    const { data: payheadAffected, isLoading } = useQuery<PayheadAffected>(
        `/api/admin/payroll/payhead/read?id=${payhead_id}`
    );
    const router = useRouter();
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [amountRecords, setAmountRecords] = useState<Map<number, number>>(new Map());
    const [filteredEmployees, setFilteredEmployees] = useState<UserEmployee[]>([]);
    const [isInvalid, setIsInvalid] = useState(false);
    const strictLevel = useMemo(()=>{
        // 0: No restriction
        // 1: Don't allow variable changes
        // 2: Also, don't affected changes
        // 3: Don't allow all changes
        
        // Payhead IDs
        // 1: Basic Salary
        // 2: Cash Disburse
        // 2: Cash Repay
        // 3: Benefits
        const calculatorSpecialCaseForSystem = [1];
        if(payheadAffected?.payhead){
            const payhead = payheadAffected.payhead;

            // Payheads associated to benefits
            if(payhead.calculation === static_formula.benefit_contribution)
                return 3;
            if(payhead.system_only)
                if(!calculatorSpecialCaseForSystem.includes(payhead.id))
                    return 2
                else
                    return 1
        }
        return 0;
    },[payheadAffected]);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: undefined,
            calculation: "",
            is_active: true,
            is_overwritable: true,
            type: payhead_type,
            variable: "",
            name: "New",
            affected_json: {
                mandatory: { probationary: false, regular: false },
                departments: "all",
                job_classes: "all",
                employees: "all",
            },
        },
        values: payheadAffected?.payhead,
    });

    const mandatory = form.watch("affected_json.mandatory");
    const departments = form.watch("affected_json.departments");
    const roles = form.watch("affected_json.job_classes");
    const employees = form.watch("affected_json.employees");

    const unSubmittable = useMemo((): string | undefined => {
        if (isInvalid) return "Syntax error in calculation";

        if (mandatory.probationary && mandatory.regular) {
            if (departments != "all" && departments.length === 0) return "Select a department(s) to be affected";
            else if (roles != "all" && roles.length === 0) return "Select a role(s) to be affected";
        }

        if (!mandatory.probationary && !mandatory.regular && employees != "all" && selectedEmployees.length === 0)
            return "Payhead is not mandatory to any work status.\n\nSelect an employee(s) to be affected.";

        return undefined;
    }, [isInvalid, mandatory, departments, roles, employees, selectedEmployees]);

    const isMandatory = useMemo(() => {
        return mandatory.regular || mandatory.probationary;
    }, [mandatory]);

    const filteredEmployeesByMandatory = useMemo(() => {
        return (
            payheadAffected?.employees.filter((emp) => {
                if (isMandatory) return true;

                if (mandatory.regular) return emp.is_regular;
                if (mandatory.probationary) return !emp.is_regular;

                return true;
            }) || []
        );
    }, [payheadAffected, isMandatory, mandatory]);

    const filteredRoles = useMemo(() => {
        return (
            payheadAffected?.job_classes.filter((job) => {
                if (Array.isArray(departments)) {
                    return departments.includes(job.department_id);
                } else {
                    return true; // "all"
                }
            }) || []
        );
    }, [departments, payheadAffected]);

    function updateAmountRecords(employee_id: number, amount: number) {
        setAmountRecords((prev) => {
            const newRecords = new Map(prev);

            if (amount > 0) {
                // Add or update the amount for the given employee_id
                newRecords.set(employee_id, amount);
            } else {
                // Remove the entry for the given employee_id
                newRecords.delete(employee_id);
            }

            return newRecords;
        });
    }

    // First load
    useEffect(() => {
        if (payheadAffected?.payhead) {
            const amount_records = payheadAffected.payhead?.dim_payhead_specific_amounts;
            if (amount_records && amount_records.length > 0) {
                amount_records.forEach((record) => {
                    updateAmountRecords(record?.employee_id, record?.amount);
                });
            }
            if (
                payheadAffected.payhead?.affected_json?.employees &&
                Array.isArray(payheadAffected.payhead.affected_json.employees) &&
                payheadAffected.payhead.affected_json.employees.length > 0
            ) {
                setSelectedEmployees(payheadAffected.payhead.affected_json.employees);
            }
        }
    }, [payheadAffected]);

    const getAmountRecords = useCallback(
        (employee_id: number): string => {
            const value = String(amountRecords.get(employee_id)) || "";
            return value;
        },
        [amountRecords]
    );

    function selectEmployee(id: number) {
        setSelectedEmployees((prev) => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            return [...updated];
        });
    }

    const handleSubmit = useCallback(
        async (value: z.infer<typeof formSchema>) => {
            if (unSubmittable) {
                toast({
                    title: unSubmittable,
                    variant: "warning",
                });
                return;
            }

            if (
                isMandatory ||
                (Array.isArray(value.affected_json.employees) &&
                    value.affected_json.employees.length === payheadAffected?.employees.length)
            ) {
                value.affected_json.employees = "all"; // Automatically involve every employees
            } else {
                value.affected_json.employees = selectedEmployees;
            }

            if (
                Array.isArray(value.affected_json.departments) &&
                value.affected_json.departments.length === payheadAffected?.departments.length
            )
                value.affected_json.departments = "all"; // Automatically involve every departments

            if (Array.isArray(value.affected_json.job_classes)) {
                const selectedRoles = new Set(
                    value.affected_json.job_classes.filter((val) => filteredRoles.map((fr) => fr.id).includes(val))
                );

                if (selectedRoles.size === filteredRoles?.length) {
                    value.affected_json.job_classes = "all"; // Automatically involve every job/roles
                } else {
                    value.affected_json.job_classes = [...selectedRoles];
                }
            }

            console.log(
                value,
                Array.from(amountRecords, ([employee_id, amount]) => ({ employee_id, amount }))
            );
            try {
                const response = await axios.post("/api/admin/payroll/payhead/upsert-payhead", {
                    data: value,
                    amountRecords: Array.from(amountRecords, ([employee_id, amount]) => ({ employee_id, amount })),
                });
                const id = response.data?.id;
                if (id) {
                    toast({
                        title: `${capitalize(payhead_type)} ${
                            payheadAffected?.payhead ? "updated" : "created"
                        } successfully`,
                        variant: "success",
                    });
                    router.push(`/payroll/${payhead_type}s/manage?id=${id}`);
                } else {
                    throw new Error("Invalid returned ID");
                }
            } catch (error) {
                toast({ title: `${error}`, variant: "danger" });
            }
        },
        [amountRecords, selectedEmployees, payheadAffected, filteredRoles, isMandatory, unSubmittable, payhead_type, router]
    );

    const totalAffectedEmployees = useMemo(() => {
        let allAffected = [
            ...filteredEmployeesByMandatory.filter((emp) =>
                isMandatory
                    ? mandatory.probationary && mandatory.regular
                        ? true
                        : mandatory.probationary && !mandatory.regular
                        ? !emp.is_regular
                        : !mandatory.probationary && mandatory.regular && emp.is_regular
                    : selectedEmployees.includes(emp.id)
            ),
        ];
        allAffected = allAffected.filter((emp) =>
            departments === "all" ? true : departments.includes(emp.ref_departments.id)
        );
        allAffected = allAffected.filter((emp) => (roles === "all" ? true : roles.includes(emp.ref_job_classes.id)));

        return new Set(allAffected.map((emp) => emp.id));
    }, [isMandatory, filteredEmployeesByMandatory, selectedEmployees, mandatory, departments, roles]);

    const invalidParams = useMemo(() => {
        if (!payhead_type) return true;

        if (!["earning", "deduction"].includes(payhead_type)) return true;

        if (payheadAffected?.payhead && payhead_type != payheadAffected?.payhead?.type) return true;

        return false;
    }, [payhead_type, payheadAffected]);

    if (isLoading) {
        return <Spinner label="Loading..." className="flex-1" />;
    } else {
        if (invalidParams)
            return (
                <div className="h-full w-full flex flex-col justify-center items-center">
                    <h1 className="text-red-500 font-semibold">This should not happend :/</h1>
                    <p className="text-gray-500 text-sm">We have encountered an invalid payhead attribute</p>
                </div>
            );
    }
    return (
        <div className="h-full w-full flex gap-2">
            <CardForm
                label={`${payheadAffected?.payhead ? "Update" : "Create"} ${payhead_type}`}
                form={form}
                onSubmit={handleSubmit}
                className="w-fit"
                classNames={{ body: { form: "space-y-4" } }}
                unSubmittable={strictLevel===3}
            >
                <FormFields
                    items={[
                        {
                            name: "name",
                            label: "Name",
                            isRequired: true,
                            config: { isDisabled: strictLevel >= 2 },
                        },
                        {
                            name: "calculation",
                            label: "Calculation",
                            config: { isDisabled: strictLevel >= 2 },
                            Component: (field) => {
                                return (
                                    <PayheadCalculator
                                        id="calculation"
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
                            config: { isDisabled: strictLevel >= 3 },
                            label: switchLabel("Writable", `Amount can be overwritten over given calculated input`),
                        },
                        {
                            name: "is_active",
                            type: "switch",
                            config: { isDisabled: strictLevel >= 3 },
                            label: switchLabel(
                                "Active",
                                `${capitalize(payhead_type)} will be effective on next payroll`
                            ),
                        },
                        {
                            name: "affected_json.mandatory",
                            Component: (field) => (
                                <ListDropDown
                                    triggerProps={{
                                        isDisabled: strictLevel >= 2
                                    }}
                                    items={[
                                        { name: "Probationary", id: "mandatory" },
                                        { name: "Regular", id: "regular" },
                                    ]}
                                    triggerName="Mandatory Status"
                                    selectedKeys={
                                        new Set(
                                            [
                                                field?.value?.probationary ? "mandatory" : undefined,
                                                field?.value?.regular ? "regular" : undefined,
                                            ].filter((key) => key !== undefined)
                                        )
                                    }
                                    onSelectionChange={(keys) => {
                                        const values = Array.from(keys);
                                        field.onChange({
                                            probationary: values.includes("mandatory"),
                                            regular: values.includes("regular"),
                                        });
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
                                    triggerProps={{
                                        isDisabled: strictLevel >= 2
                                    }}
                                    items={payheadAffected?.departments || []}
                                    triggerName="Departments"
                                    selectedKeys={
                                        Array.isArray(field.value)
                                            ? new Set(field.value)
                                            : new Set(payheadAffected?.departments.map((dp) => dp.id)) // "all"
                                    }
                                    onSelectionChange={(keys) => {
                                        field.onChange([...keys]);
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
                                    triggerProps={{
                                        isDisabled: strictLevel >= 2
                                    }}
                                    items={filteredRoles}
                                    triggerName="Roles"
                                    selectedKeys={
                                        Array.isArray(field.value)
                                            ? new Set(
                                                  field.value.filter((val) =>
                                                      filteredRoles.map((jc) => jc.id).includes(val)
                                                  )
                                              )
                                            : new Set(filteredRoles.map((jc) => jc.id)) // "all"
                                    }
                                    onSelectionChange={(keys) => field.onChange([...keys])}
                                    togglable={true}
                                    reversable={true}
                                    sectionConfig={payheadAffected?.departments
                                        .filter((dep) => {
                                            if (Array.isArray(departments)) {
                                                return departments.includes(dep.id);
                                            } else {
                                                return true; // "all"
                                            }
                                        })
                                        .map((dep) => {
                                            return {
                                                name: dep.name,
                                                key: "department_id",
                                                id: dep.id,
                                            };
                                        })}
                                />
                            ),
                        },
                        {
                            name: "variable",
                            config: { isDisabled: strictLevel >= 1 },
                            label: "Variable ( intended for reusability )",
                            isRequired: false,
                        },
                    ]}
                />
            </CardForm>
            <div className="w-full h-full overflow-auto ">
                <div className="sticky top-0 left-0 bg-gray-50 z-10 pb-4 shadow-md flex justify-between">
                    <SearchFilter
                        items={filteredEmployeesByMandatory}
                        setResults={setFilteredEmployees}
                        className="w-80"
                        searchConfig={[
                            {
                                key: "first_name",
                                label: "",
                            },
                            {
                                key: "middle_name",
                                label: "",
                            },
                            {
                                key: "last_name",
                                label: "Name",
                            },
                            {
                                key: "email",
                                label: "Email",
                            },
                        ]}
                    />
                    <p className="text-gray-500 font-semibold text-small">
                        {totalAffectedEmployees.size} employees affected
                    </p>
                </div>
                <div className="min-w-[750px] space-y-1 h-fit">
                    {filteredEmployees.map((item: UserEmployee) => (
                        <div
                            key={item.id}
                            className={cn(
                                "p-4 border-2 cursor-pointer",
                                strictLevel >= 2 && "opacity-50",
                                isMandatory
                                    ? "border-gray-50"
                                    : selectedEmployees.includes(item.id)
                                    ? totalAffectedEmployees.has(item.id)
                                        ? "border-blue-500"
                                        : "border-gray-500"
                                    : "border-gray-50"
                            )}
                        >
                            <div className="flex flex-row gap-4">
                                <div className="flex-1">
                                    <UserMail
                                        name={getEmpFullName(item)}
                                        picture={item.picture}
                                        email={item.email}
                                        onClick={() => {
                                            if(strictLevel < 2)
                                                selectEmployee(item.id)
                                        }}
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
    id: z.number().optional(),
    name: z
        .string()
        .min(3, { message: "Name must be at least 3 characters." })
        .max(20, { message: "Name cannot exceed 20 characterd." }),
    calculation: z.string().optional(),
    is_active: z.boolean(),
    is_overwritable: z.boolean().optional(),
    variable: z.string().max(14).optional(),
    type: z.string(),
    affected_json: z.object({
        mandatory: z.object({
            probationary: z.boolean(),
            regular: z.boolean(),
        }),
        departments: z.union([z.array(z.number()), z.literal("all")]),
        job_classes: z.union([z.array(z.number()), z.literal("all")]),
        employees: z.union([z.array(z.number()), z.literal("all")]),
    }),
});
