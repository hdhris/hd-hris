"use client"
import React, {useMemo} from 'react';
// import DataDisplay from "@/components/common/data-display/data-display";
import {useQuery} from "@/services/queries";
import {LeaveType} from "@/types/leaves/LeaveTypes";
// import DataDisplay from "@/components/common/data-display/draft/data-display";
import {
    filterLeaveTypes, LeaveTypeTableConfiguration
} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import DataDisplay from "@/components/common/data-display/data-display";
import {Card, CardBody} from "@nextui-org/card";


const typesOfLeaves: LeaveType[] = [{
    id: 1,
    accrual_frequency: 'Annually',
    accrual_rate: 10,
    applicable_to_employee_types: 'regular',
    attachment_required: true,
    code: 'AL01',
    created_at: '2024-01-01T10:00:00Z',
    description: 'Annual Leave for Regular Employees',
    is_active: true,
    max_accrual: 30,
    max_duration: 15,
    min_duration: 1,
    name: 'Annual Leave',
    notice_required: 7,
    paid_leave: true,
    updated_at: '2024-06-01T12:00:00Z',
    carry_over: true,
    employee_count: 200,
}, {
    id: 2,
    accrual_frequency: 'Monthly',
    accrual_rate: 1,
    applicable_to_employee_types: 'probationary',
    attachment_required: false,
    code: 'SL01',
    created_at: '2024-02-01T11:00:00Z',
    description: 'Sick Leave for Probationary Employees',
    is_active: true,
    max_accrual: 12,
    max_duration: 5,
    min_duration: 0.5,
    name: 'Sick Leave',
    notice_required: 1,
    paid_leave: true,
    updated_at: '2024-06-05T14:00:00Z',
    carry_over: false,
    employee_count: 50,
}, {
    id: 3,
    accrual_frequency: 'Weekly',
    accrual_rate: 0.5,
    applicable_to_employee_types: 'regular',
    attachment_required: false,
    code: 'ML01',
    created_at: '2024-03-10T09:30:00Z',
    description: 'Maternity Leave for Regular Employees',
    is_active: true,
    max_accrual: 60,
    max_duration: 60,
    min_duration: 30,
    name: 'Maternity Leave',
    notice_required: 30,
    paid_leave: true,
    updated_at: '2024-06-15T13:45:00Z',
    carry_over: false,
    employee_count: 80,
}, {
    id: 4,
    accrual_frequency: 'Daily',
    accrual_rate: 0.2,
    applicable_to_employee_types: 'regular',
    attachment_required: true,
    code: 'PL01',
    created_at: '2024-04-01T08:00:00Z',
    description: 'Paternity Leave for Regular Employees',
    is_active: true,
    max_accrual: 14,
    max_duration: 7,
    min_duration: 1,
    name: 'Paternity Leave',
    notice_required: 14,
    paid_leave: true,
    updated_at: '2024-06-10T10:30:00Z',
    carry_over: false,
    employee_count: 100,
}, {
    id: 5,
    accrual_frequency: 'Annually',
    accrual_rate: 5,
    applicable_to_employee_types: 'probationary',
    attachment_required: false,
    code: 'EL01',
    created_at: '2024-05-05T12:00:00Z',
    description: 'Emergency Leave for Probationary Employees',
    is_active: true,
    max_accrual: 10,
    max_duration: 3,
    min_duration: 1,
    name: 'Emergency Leave',
    notice_required: 1,
    paid_leave: true,
    updated_at: '2024-07-01T11:00:00Z',
    carry_over: true,
    employee_count: 40,
}, {
    id: 6,
    accrual_frequency: 'Monthly',
    accrual_rate: 2,
    applicable_to_employee_types: 'regular',
    attachment_required: true,
    code: 'VL01',
    created_at: '2024-02-15T14:00:00Z',
    description: 'Vacation Leave for Regular Employees',
    is_active: true,
    max_accrual: 20,
    max_duration: 10,
    min_duration: 2,
    name: 'Vacation Leave',
    notice_required: 5,
    paid_leave: true,
    updated_at: '2024-07-05T16:00:00Z',
    carry_over: true,
    employee_count: 120,
}, {
    id: 7,
    accrual_frequency: 'Weekly',
    accrual_rate: 1,
    applicable_to_employee_types: 'regular',
    attachment_required: false,
    code: 'BL01',
    created_at: '2024-03-20T13:30:00Z',
    description: 'Bereavement Leave for Regular Employees',
    is_active: true,
    max_accrual: 7,
    max_duration: 7,
    min_duration: 1,
    name: 'Bereavement Leave',
    notice_required: 2,
    paid_leave: true,
    updated_at: '2024-07-10T15:30:00Z',
    carry_over: false,
    employee_count: 60,
}, {
    id: 8,
    accrual_frequency: 'Annually',
    accrual_rate: 8,
    applicable_to_employee_types: 'regular',
    attachment_required: true,
    code: 'HL01',
    created_at: '2024-01-25T10:00:00Z',
    description: 'Health Leave for Regular Employees',
    is_active: true,
    max_accrual: 25,
    max_duration: 15,
    min_duration: 3,
    name: 'Health Leave',
    notice_required: 10,
    paid_leave: true,
    updated_at: '2024-07-15T12:00:00Z',
    carry_over: true,
    employee_count: 180,
}, {
    id: 9,
    accrual_frequency: 'Monthly',
    accrual_rate: 3,
    applicable_to_employee_types: 'probationary',
    attachment_required: false,
    code: 'CL01',
    created_at: '2024-02-25T09:00:00Z',
    description: 'Casual Leave for Probationary Employees',
    is_active: true,
    max_accrual: 12,
    max_duration: 6,
    min_duration: 1,
    name: 'Casual Leave',
    notice_required: 1,
    paid_leave: true,
    updated_at: '2024-07-20T14:00:00Z',
    carry_over: false,
    employee_count: 35,
}, {
    id: 10,
    accrual_frequency: 'Daily',
    accrual_rate: 0.1,
    applicable_to_employee_types: 'regular',
    attachment_required: true,
    code: 'OL01',
    created_at: '2024-04-15T11:00:00Z',
    description: 'Overtime Leave for Regular Employees',
    is_active: true,
    max_accrual: 40,
    max_duration: 20,
    min_duration: 4,
    name: 'Overtime Leave',
    notice_required: 3,
    paid_leave: false,
    updated_at: '2024-07-25T10:30:00Z',
    carry_over: true,
    employee_count: 90,
}];


function Page() {
    const {data, isLoading} = useQuery<LeaveType[]>("/api/admin/leaves/leave-types", {
        refreshInterval: 3000
    });
    const leaveData = useMemo(() => {
        if (!data) return []
        return data
    }, [data])

    return (<DataDisplay
        title="Leave Types"
        data={leaveData}
        filterProps={{
            filterItems: filterLeaveTypes
        }}
        sortProps={{
            sortItems: [{
                key: "id", name: "ID"
            }, {key: "name", name: "Name"}, {key: "created_at", name: "Created At"}, {
                key: "is_active", name: "Status"
            }],
            initialValue: {
                column: "id", direction: "ascending"
            },

        }}
        searchProps={{
            searchingItemKey: ["name"]
        }}
        paginationProps={{
            loop: true,
        }}
        onTableDisplay={{
            config: LeaveTypeTableConfiguration, isLoading, onRowAction: (key) => alert(key)
        }}
        onGridDisplay={(data) => {
            return (<pre>{JSON.stringify(data, null, 2)}</pre>)
        }}

        onListDisplay={(data) => {
            return (<Card className="w-full">
                    <CardBody>{data.name}</CardBody>
                </Card>

            )
        }}
        onExport={{
            drawerProps: {
                title: "Export",
            }
        }}
        onImport={{
            drawerProps: {
                title: "Import",
            }
        }}
    />);
}

export default Page;