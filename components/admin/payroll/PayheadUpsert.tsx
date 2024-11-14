"use client";
import CardForm from "@/components/common/forms/CardForm";
import FormFields from "@/components/common/forms/FormFields";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { switchLabel } from "../attendance-time/holidays/script";
import { useQuery } from "@/services/queries";
import { PayheadAffected } from "@/types/payroll/payheadType";
import PayheadCalculator from "./Calculator/Calculator";
import { Spinner, Selection, Avatar } from "@nextui-org/react";
import { capitalize } from "lodash";
import { ListDropDown } from "./ListBoxDropDown";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { UserEmployee } from "@/helper/include-emp-and-reviewr/include";
import TableData from "@/components/tabledata/TableData";

function PayheadUpsert({ payhead_id, payhead_type }: { payhead_id?: string; payhead_type?: string }) {
    const { data: payheadAffected, isLoading } = useQuery<PayheadAffected>(
        `/api/admin/payroll/payhead/read?id=${payhead_id}`
    );
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
            },
            dim_payhead_affecteds: [],
        },
        values: payheadAffected?.payhead,
    });

    async function handleSubmit(value: z.infer<typeof formSchema>) {
        console.log(value);
    }

    const config: TableConfigProps<UserEmployee> = {
        columns: [
            { uid: "name", name: "Name", sortable: true },
            { uid: "role", name: "Role", sortable: true },
        ],
        rowCell: (item, columnKey) => {
            switch (columnKey) {
                case "name":
                    return (
                        <div className="flex items-center space-x-2">
                            <Avatar src={item.picture} />
                            <p className="capitalize">{`${item.first_name} ${item.middle_name} ${item.last_name}`}</p>
                        </div>
                    );
                case "role":
                    return (
                        <div>
                            <p>{item.ref_job_classes ? item.ref_job_classes.name : "None"}</p>
                            <p className=" text-gray-500">
                                {item.ref_departments ? item.ref_departments.name : "None"}
                            </p>
                        </div>
                    );
                default:
                    return <></>;
            }
        },
    };

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
                                                field?.value?.probationary ? "1" : undefined,
                                                field?.value?.regular ? "2" : undefined,
                                            ].filter((key) => key !== undefined)
                                        )
                                    }
                                    onSelectionChange={(keys) => {
                                        const values = Array.from(keys);
                                        field.onChange({
                                            probationary: values.includes("1"),
                                            regular: values.includes("2"),
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
                                        field.onChange(Array.from(keys));
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
            <TableData
                config={config}
                items={payheadAffected?.employees || []}
                isLoading={isLoading}
                // selectedKeys={isFiltered ? new Set([]) : selectedEmployees}
                // disabledKeys={disabledKeys}
                searchingItemKey={["first_name", "middle_name", "last_name"]}
                // onSelectionChange={setSelectedEmployees}
                counterName="Employees"
                className="flex-1 w-full h-full"
                removeWrapper
                isHeaderSticky
                color={"primary"}
                // selectionMode={isFiltered ? "single" : "multiple"}
                aria-label="Employees"
                // filterItems={
                //     !isFiltered
                //         ? [
                //               {
                //                   filtered: data.departments.map((dep) => {
                //                       return {
                //                           name: dep.name,
                //                           value: "dep_" + dep.id,
                //                           key: "",
                //                       };
                //                   }),
                //                   category: "Department",
                //               },
                //               {
                //                   filtered: data.job_classes.map((job) => {
                //                       return {
                //                           name: job.name,
                //                           value: "job_" + job.id,
                //                           key: "",
                //                       };
                //                   }),
                //                   category: "Roles",
                //               },
                //           ]
                //         : undefined
                // }
                filterConfig={(keys) => {
                    let filteredItems: UserEmployee[] = [...payheadAffected?.employees!];

                    if (keys !== "all" && keys.size > 0) {
                        console.log(Array.from(keys));
                        Array.from(keys).forEach((key) => {
                            const [uid, value] = (key as string).split("_");
                            filteredItems = filteredItems.filter((items) => {
                                if (uid.includes("dep")) {
                                    return items.ref_departments.id === Number(value);
                                } else if (uid.includes("job")) {
                                    return items.ref_job_classes.id === Number(value);
                                }
                            });
                        });
                    }

                    return filteredItems;
                }}
            />
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
    }),
    dim_payhead_affecteds: z.array(
        z.object({
            id: z.number(),
            payhead_id: z.number(),
            employee_id: z.number(),
            created_at: z.string(),
            updated_at: z.string(),
            default_amount: z.number(),
        })
    ),
});
