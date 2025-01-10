"use client"
import React, {useMemo, useState} from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {useControl} from "@/components/admin/reports/reports-controls/provider/reports-control-provider";
import {Select, SelectItem} from "@nextui-org/react";
import {usePayrollReportDate} from "@/services/queries";
import useSWR from "swr";
import {toGMT8} from "@/lib/utils/toGMT8";
import fetcher from "@/services/fetcher";
import {LeaveReports} from "@/types/report/leaves/leave-types";


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
    } = useSWR(`/api/admin/reports/statutory-deductions?date=${date_id}&plan_id=${statutory_id}`)

    // const leave: LeaveReports[] =  useMemo(() => {
    //     if(data) return data.results
    //     return []
    // }, [data])
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

        {JSON.stringify(data, null, 2)}
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