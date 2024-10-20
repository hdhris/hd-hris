"use client"

import {ColumnsProps, TableConfigProps} from "@/types/table/TableDataTypes";
import {LeaveType} from "@/types/leaves/LeaveTypes";
import React from "react";
import {Case, Default, Switch} from "@/components/common/Switch";
import Typography from "@/components/common/typography/Typography";
import {TableActionButton} from "@/components/actions/ActionButton";
import {Status} from "@/components/status/Status";
import {LuCheckCheck, LuX} from "react-icons/lu";
import {ChipProps, cn} from "@nextui-org/react";
import {icon_size_sm} from "@/lib/utils";
import {Chip} from "@nextui-org/chip";
import uniqolor from "uniqolor";
import {rgba} from "color2k";
import {FilterProps} from "@/types/table/default_config";

const LeaveTypesTableColumns: ColumnsProps[] = [{
    name: "Name", uid: "name", sortable: true
}, {
    name: "Code", uid: "code"
}, {
    name: "Applicable For", uid: "applicable_to_employee_types",
}, {
    name: "Duration Range", uid: "duration_range"
}, {
    name: "Paid Leave", uid: "paid_leave"
}, {
    name: "Status", uid: "is_active"
}]

const employee_types_color_map: Record<string, ChipProps["color"]> = {
    all: "success", regular: "warning", probationary: "danger"
}


export const LeaveTypeTableConfiguration: TableConfigProps<LeaveType> = {
    columns: LeaveTypesTableColumns, rowCell: function (item: LeaveType, columnKey: React.Key) {
        const key = columnKey as keyof LeaveType
        const cellValue = item[key]
        const color = uniqolor(item.code, {format: "rgb"}).color.replace("rgb(", "").replace(")", "").split(",")
        const rgbaColor = rgba(Number(color.at(0)), Number(color.at(1)), Number(color.at(2)), 0.2)
        return (<Switch expression={key}>
            <Case of="name">
                <Typography className="font-semibold">{item.name}</Typography>
            </Case>
            <Case of="code">
                <div className="rounded-full size-8 grid place-items-center " style={{
                    background: rgbaColor,
                }}>
                    <Typography className="font-semibold">{cellValue}</Typography>
                </div>

            </Case>
            <Case of="duration_range">
                <Typography>{`${item.min_duration} - ${item.max_duration} Day/s`}</Typography>
            </Case>
            <Case of="applicable_to_employee_types">
                <Chip variant="flat" radius="sm"
                      color={employee_types_color_map[item.applicable_to_employee_types.toLowerCase()]}>
                    {item.applicable_to_employee_types}
                </Chip>

            </Case>
            <Case of="paid_leave">
                <div className="ms-5">
                    {item.paid_leave ? <LuCheckCheck className={cn("text-success", icon_size_sm)}/> :
                        <LuX className={cn("text-danger", icon_size_sm)}/>}
                    <Typography as="span" className="sr-only">{String(item.paid_leave)}</Typography>
                </div>
            </Case>
            <Case of="is_active">
                <Status color={item.is_active ? "success" : "default"}>
                    {item.is_active ? "Active" : "Inactive"}
                </Status>
            </Case>
            {/*<Case of="employee_count">*/}
            {/*    <div className="rounded-full bg-slate-500/20 size-5 grid place-items-center ">*/}
            {/*        <Typography className="font-semibold">{cellValue}</Typography>*/}
            {/*    </div>*/}
            {/*</Case>*/}
            <Default>
                {cellValue}
            </Default>
        </Switch>)
    }
}

const filterKeyEmpCat = "applicable_to_employee_types"
const filterKeyPaidLeave = "paid_leave"
export const filterLeaveTypes: FilterProps[] = [{
    filtered: [{
        name: "All", key: filterKeyEmpCat, value: "All"
    }, {
        name: "Regular", key: filterKeyEmpCat, value: "Regular"
    }, {
        name: "Probationary", key: filterKeyEmpCat, value: "Probationary"
    }], category: "Employee Category"
}, {
    filtered: [{
        name: "Paid", key: filterKeyPaidLeave, value: true
    }, {
        name: "Not Paid", key: filterKeyPaidLeave, value: false
    }], category: "Is Paid"
}]





