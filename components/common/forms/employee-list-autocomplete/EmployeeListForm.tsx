"use client"
import React from 'react';
import { Controller, useFormContext } from "react-hook-form";
import { Autocomplete, AutocompleteItem, cn, User } from "@nextui-org/react";
import { LuChevronsUpDown } from "react-icons/lu";
import Typography from "@/components/common/typography/Typography";

export type Employee = {
    id: number;
    name: string;
    picture: string;
    department: string;
};

interface EmployeeListForm {
    employees: Employee[],
    isLoading?: boolean
}

function EmployeeListForm({employees, isLoading}: EmployeeListForm) {
    const user = React.useMemo(() => {
        // if(employees) return employees.sort((a, b) => a.name.localeCompare(b.name));
        if(employees) return employees;
        return [];
    }, [employees])
    const { control, setValue, formState: { errors } } = useFormContext();
    return (
        <div>
            <Controller
                control={control}
                name="employee_id"
                render={({ field }) => (
                    <>
                        <Autocomplete
                            label={
                                <Typography
                                    className={cn(
                                        "text-sm font-medium inline-flex",
                                        errors.employee_id ? "text-red-500" : ""
                                    )}
                                >
                                    Pick an Employee
                                </Typography>
                            }
                            isClearable={false}
                            isRequired
                            radius="sm"
                            placeholder="Select an Employee"
                            defaultItems={user}
                            labelPlacement="outside"
                            className="w-full"
                            variant="bordered"
                            isLoading={isLoading}
                            selectedKey={field.value ? String(field.value) : null}
                            disableSelectorIconRotation
                            selectorIcon={<LuChevronsUpDown />}
                            onSelectionChange={(e) => {
                                const selectedItem = user.find(item => String(item.id) === String(e));
                                if (selectedItem) {
                                    setValue('employee_id', selectedItem.id);
                                    field.onChange(selectedItem.id);
                                } else{
                                    setValue('employee_id', "");
                                    field.onChange("");
                                }
                            }}
                            {...field}
                        >
                            {(item) => (
                                <AutocompleteItem textValue={item.name} key={item.id}>
                                    <User
                                        name={item.name}
                                        description={item.department}
                                        avatarProps={{
                                            src: item.picture,
                                        }}
                                    />
                                </AutocompleteItem>
                            )}
                        </Autocomplete>

                        {/* Display error message if employee_id has validation issues */}
                        {errors.employee_id && (
                            <Typography className="text-[0.8rem] font-medium text-red-500 mt-2">
                                {errors.employee_id.message as string}
                            </Typography>
                        )}
                    </>
                )}
            />
        </div>
    );
}

export default EmployeeListForm;
