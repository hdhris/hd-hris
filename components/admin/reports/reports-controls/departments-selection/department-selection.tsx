"use client"
import React, {useMemo} from 'react';
import {useDepartments} from "@/services/queries";
import {Select, SelectItem} from "@nextui-org/react";

function DepartmentSelection() {
    const {data, isLoading} = useDepartments()
    const departments = useMemo(() => {
        if(data){
            return data
        }
        return []
    }, [data])
    return (
        <Select size="sm" radius="sm" variant="bordered" placeholder="Select Department" isLoading={isLoading}>
            {
                [{id: 0, name: "All"}, ...departments].map(department => (
                    <SelectItem key={department.id} value={department.name}>{department.name}</SelectItem>
                ))
            }
        </Select>
    );
}

export default DepartmentSelection;