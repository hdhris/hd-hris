"use client"
import React, {useMemo, useState} from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {useControl} from "@/components/admin/reports/reports-controls/provider/reports-control-provider";
import {Select, SelectItem} from "@nextui-org/react";
import {usePayrollReportDate} from "@/services/queries";
import useSWR from "swr";
import {toGMT8} from "@/lib/utils/toGMT8";
import fetcher from "@/services/fetcher";
import {EmployeeContribution} from "@/types/report/benefits/contribution-types";
import Loading from '@/components/spinner/Loading';
import NoData from "@/components/common/no-data/NoData";
import {numberWithCommas} from "@/lib/utils/numberFormat";
import BorderCard from "@/components/common/BorderCard";


interface StatutoryName {
    id: number;
    name: string
}

function BenefitReport() {
    const {value} = useControl()
    const [date_id, setDate_id] = useState<number>()
    const [statutory_id, setStatutory_id] = useState<number>()
    const {data: payroll_date, isLoading: payroll_date_is_loading, error} = usePayrollReportDate()
    const payroll_date_deployed = useMemo(() => {
        if (payroll_date) {
            // console.log(payroll_date)
            return payroll_date
        }
    }, [payroll_date]);

    const {
        data: statutory_name, isLoading: statutory_name_loading
    } = useSWR<StatutoryName[]>(`/api/admin/reports/statutory-deductions/statutory_name`, fetcher)
    const {
        data, isLoading
    } = useSWR<EmployeeContribution[]>(`/api/admin/reports/statutory-deductions?date=${date_id}&plan_id=${statutory_id}`)

    const statutory: EmployeeContribution[] = useMemo(() => {
        if (data) return data
        return []
    }, [data])
    SetNavEndContent(() => {
        return <div className="flex gap-2">
            <Select
                isLoading={payroll_date_is_loading}
                className="w-64"
                items={payroll_date_deployed || []}
                variant="bordered"
                size="sm"
                color="primary"
                aria-label="Date"
                placeholder="Select payroll date"
                onSelectionChange={(value) => setDate_id(Number(value.currentKey))}
            >
                {(item) => <SelectItem key={item.id}>{item.date}</SelectItem>}
            </Select>
            <Select
                isLoading={statutory_name_loading}
                className="w-48"
                items={statutory_name || []}
                variant="bordered"
                size="sm"
                color="primary"
                aria-label="Statutory"
                placeholder="Select Statutory Name"
                onSelectionChange={(value) => setStatutory_id(Number(value.currentKey))}
            >
                {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
            </Select>
        </div>
    })

    return (<div className="h-full">
        <BorderCard className="h-full overflow-auto p-2">
            {statutory_id && statutory && statutory.length > 0 ? <table className="w-full border-collapse p-2">
                <thead className="bg-gray-100 sticky top-0">
                <tr>
                    <th colSpan={11}
                        className="p-3">{statutory_name && statutory_name.find(item => item.id === statutory_id)?.name}</th>
                </tr>
                <tr>
                    <th className="p-3 text-left border text-[7pt]">ID</th>
                    <th className="p-3 text-left border text-[7pt]">Name</th>
                    <th className="p-3 text-left border text-[7pt]">Department</th>
                    <th className="p-3 text-left border text-[7pt]">Job</th>
                    <th className="p-3 text-left border text-[7pt]">Appointment Status</th>
                    <th className="p-3 text-left border text-[7pt]">Salary</th>
                    <th className="p-3 tex-left border text-[7pt]">Contribution Date</th>
                    <th className="p-3 tex-left border text-[7pt]">Contribution Type</th>
                    <th className="p-3 tex-left border text-[7pt]">Employer Contribution</th>
                    <th className="p-3 tex-left border text-[7pt]">Employee Contribution</th>
                    <th className="p-3 tex-left border text-[7pt]">Total Contribution</th>
                    {/*<th className="p-3 tex-left border text-[7pt]">Allocated Days</th>*/}
                    {/*/!*<th className="p-3 tex-left border text-[7pt]">Carry Forward Days</th>*!/*/}
                    {/*<th className="p-3 tex-left border text-[7pt]">Remaining Days</th>*/}
                    {/*<th className="p-3 tex-left border text-[7pt]">Used Days</th>*/}
                </tr>
                </thead>
                <tbody>
                {statutory.map((item, index) => {
                    return <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border text-[7pt]">{item.id}</td>
                        <td className="p-3 border text-[7pt]">{item.name}</td>
                        <td className="p-3 border text-[7pt]">{item.department}</td>
                        <td className="p-3 border text-[7pt]">{item.job}</td>
                        <td className="p-3 border text-[7pt]">{item.appointment_status}</td>
                        <td className="p-3 border text-[7pt] font-bold">{numberWithCommas(item.salary)}</td>
                        <td className="p-3 border text-[7pt]">{toGMT8(item.contribution_date).format("YYYY-MM-DD")}</td>
                        <td className="p-3 border text-[7pt]">{item.contribution_type}</td>
                        <td className="p-3 border text-[7pt]">{numberWithCommas(item.employer_contribution)}</td>
                        <td className="p-3 border text-[7pt]">{numberWithCommas(item.employee_contribution)}</td>
                        <td className="p-3 border text-[7pt] font-bold">{numberWithCommas(item.total_contribution)}</td>

                    </tr>
                })}
                </tbody>
            </table> : isLoading ? <Loading/> : <NoData message="No Statutory Deduction found."/>}
        </BorderCard>
        {/*<ReportTable endpoint="/api/admin/reports/attendance-logs" columns={{*/}
        {/*    columns: [*/}
        {/*        {*/}
        {/*            uid: "id",*/}
        {/*            name: "ID",*/}
        {/*            sortable: true*/}
        {/*        },{*/}
        {/*            uid: "employee",*/}
        {/*            name: "Name",*/}
        {/*            sortable: true,*/}
        {/*        },{*/}
        {/*            uid: "department",*/}
        {/*            name: "Department",*/}
        {/*            sortable: true,*/}
        {/*        },{*/}
        {/*            uid: "timestamp",*/}
        {/*            name: "Timestamp"*/}
        {/*        },{*/}
        {/*            uid: "status",*/}
        {/*            name: "Status",*/}
        {/*        },{*/}
        {/*            uid: "punch",*/}
        {/*            name: "Punch",*/}
        {/*        }*/}
        {/*    ]*/}
        {/*}}/>*/}
    </div>);
}

export default BenefitReport;