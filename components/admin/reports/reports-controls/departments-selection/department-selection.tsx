"use client"
import React, {useMemo} from 'react';
import {useDepartments} from "@/services/queries";
import {Select, SelectItem} from "@nextui-org/react";
import {useControl} from "@/components/admin/reports/reports-controls/provider/reports-control-provider";

function DepartmentSelection() {
    const {data, isLoading} = useDepartments()
    const {updateValue} = useControl()
    const departments = useMemo(() => {
        if(data){
            return data
        }
        return []
    }, [data])
    return (
        <Select disallowEmptySelection defaultSelectedKeys={["0"]} size="sm" radius="sm" variant="bordered" placeholder="Select Department" aria-labelledby="Department Select" isLoading={isLoading} onSelectionChange={(value) => updateValue({department: Number(value.currentKey), date: {start: "", end: ""}})}>
            {
                [{id: 0, name: "All"}, ...departments].map(department => (
                    <SelectItem key={department.id} value={department.name}>{department.name}</SelectItem>
                ))
            }
        </Select>
    );
}

export default DepartmentSelection;