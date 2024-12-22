"use client"
import React, {useMemo} from 'react';
import {useDepartments} from "@/services/queries";
import {Select, SelectItem} from "@nextui-org/react";
import {useControl} from "@/components/admin/reports/reports-controls/provider/reports-control-provider";
import {Label} from "@/components/ui/label";

function DepartmentSelection() {
    const {data, isLoading} = useDepartments()
    const {updateValue} = useControl()
    const departments = useMemo(() => {
        if (data) {
            return data
        }
        return []
    }, [data])
    return (<div className="flex flex-col gap-2">
            {/*<Label>Select Department</Label>*/}
            <Select disallowEmptySelection defaultSelectedKeys={["0"]} radius="sm" variant="bordered"
                    label="Select Department"
                    labelPlacement="outside"
                    placeholder="Select Department" aria-labelledby="Department Select" isLoading={isLoading}
                    onSelectionChange={(value) => updateValue({
                        department: Number(value.currentKey),
                        date: {start: "", end: ""}
                    })}>
                {[{id: 0, name: "All"}, ...departments].map(department => (
                    <SelectItem key={department.id} value={department.name}>{department.name}</SelectItem>))}
            </Select>
        </div>

    );
}

export default DepartmentSelection;