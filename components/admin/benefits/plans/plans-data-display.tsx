"use client"

import React, {useMemo, useState} from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {FilterItems, TableConfigurations} from "@/components/admin/leaves/table-config/approval-tables-configuration";
import BorderCard from "@/components/common/BorderCard";
import DataDisplay from "@/components/common/data-display/data-display";
import {usePaginateQuery} from "@/services/queries";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import dayjs from "dayjs";
import {LeaveRequest} from "@/types/leaves/LeaveRequestTypes";
import { Calendar, DollarSign, Users, Clock, AlertCircle, Heart, Activity, Eye, Shield, Briefcase, Zap } from 'lucide-react'
import {Card} from "@nextui-org/react";
import {CardBody, CardHeader} from "@nextui-org/card";
import Typography from "@/components/common/typography/Typography";
import {Chip} from "@nextui-org/chip";


const benefitPlans = [
    {
        id: 1,
        name: 'Health Plus',
        type: 'Health',
        eligibilityCriteria: { yearsOfService: 1 },
        coverageDetails: 'Covers inpatient and outpatient services',
        employerContribution: 200.00,
        employeeContribution: 50.00,
        effectiveDate: '2023-01-01',
        expirationDate: '2024-12-31',
        description: 'Basic health insurance plan'
    },
    {
        id: 2,
        name: 'Dental Care',
        type: 'Dental',
        eligibilityCriteria: { jobRole: "Full-time" },
        coverageDetails: 'Covers dental checkups and procedures',
        employerContribution: 100.00,
        employeeContribution: 20.00,
        effectiveDate: '2023-06-01',
        expirationDate: '2024-05-31',
        description: 'Dental insurance for employees'
    },
    {
        id: 3,
        name: 'Vision Premium',
        type: 'Vision',
        eligibilityCriteria: { hoursPerWeek: 30 },
        coverageDetails: 'Includes eye exams, glasses, and contacts',
        employerContribution: 70.00,
        employeeContribution: 10.00,
        effectiveDate: '2023-04-01',
        expirationDate: '2024-03-31',
        description: 'Premium vision care package'
    },
    {
        id: 4,
        name: 'Life Basic',
        type: 'Life',
        eligibilityCriteria: { yearsOfService: 2 },
        coverageDetails: 'Basic life insurance coverage',
        employerContribution: 50.00,
        employeeContribution: 10.00,
        effectiveDate: '2023-07-01',
        expirationDate: '2025-06-30',
        description: 'Basic life insurance plan for all employees'
    },
    {
        id: 5,
        name: 'Health Elite',
        type: 'Health',
        eligibilityCriteria: { yearsOfService: 3 },
        coverageDetails: 'Extended coverage for family members',
        employerContribution: 250.00,
        employeeContribution: 75.00,
        effectiveDate: '2022-09-01',
        expirationDate: '2024-08-31',
        description: 'Premium health insurance plan'
    },
    {
        id: 6,
        name: '401k Retirement',
        type: 'Retirement',
        eligibilityCriteria: { jobRole: "All" },
        coverageDetails: 'Employer matching up to 5%',
        employerContribution: 150.00,
        employeeContribution: 50.00,
        effectiveDate: '2023-01-01',
        expirationDate: '2024-12-31',
        description: 'Retirement savings plan with matching'
    },
    {
        id: 7,
        name: 'Accidental Death',
        type: 'Life',
        eligibilityCriteria: { jobRole: "Part-time" },
        coverageDetails: 'Coverage in case of accidental death',
        employerContribution: 80.00,
        employeeContribution: 20.00,
        effectiveDate: '2023-03-01',
        expirationDate: '2024-02-29',
        description: 'Supplementary life insurance'
    },
    {
        id: 8,
        name: 'Short-Term Disability',
        type: 'Disability',
        eligibilityCriteria: { yearsOfService: 1 },
        coverageDetails: 'Short-term income replacement',
        employerContribution: 120.00,
        employeeContribution: 30.00,
        effectiveDate: '2023-05-01',
        expirationDate: '2024-04-30',
        description: 'Disability coverage for up to 6 months'
    },
    {
        id: 9,
        name: 'Long-Term Disability',
        type: 'Disability',
        eligibilityCriteria: { jobRole: "Full-time" },
        coverageDetails: 'Extended income replacement',
        employerContribution: 180.00,
        employeeContribution: 40.00,
        effectiveDate: '2022-11-01',
        expirationDate: '2024-10-31',
        description: 'Long-term disability plan'
    },
    {
        id: 10,
        name: 'Wellness Program',
        type: 'Health',
        eligibilityCriteria: { jobRole: "All" },
        coverageDetails: 'Includes gym memberships and wellness classes',
        employerContribution: 50.00,
        employeeContribution: 5.00,
        effectiveDate: '2023-01-01',
        expirationDate: '2024-12-31',
        description: 'Wellness and preventive health plan'
    }
]



interface LeaveRequestPaginate {
    data: LeaveRequest[]
    totalItems: number
}
function PlansDataDisplay() {
    // const TypeIcon = ({ type }: { type: any }) => {
    //     const Icon = typeIcons[type] || AlertCircle
    //     return <Icon className="w-5 h-5" />
    // }

    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)

    const {data, isLoading} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/requests", page, rows, {
        refreshInterval: 3000
    });
    const allRequests = useMemo(() => {
        console.log("Leave Data: ", data?.data)
        if (data) return data.data.map((item) => {
            const approvedBy = {
                name: getEmpFullName(item.trans_employees_leaves_approvedBy),
                picture: item.trans_employees_leaves_approvedBy?.picture
            }

            return {
                id: item.id,
                picture: item.trans_employees_leaves?.picture,
                email: item.trans_employees_leaves?.email || "N/A",
                name: getEmpFullName(item.trans_employees_leaves),
                leave_type: item?.ref_leave_types?.name!,
                start_date: dayjs(item.start_date).format('YYYY-MM-DD'), // Format date here
                end_date: dayjs(item.end_date).format('YYYY-MM-DD'),     // Format date here
                total_days: dayjs(item.end_date).diff(item.start_date, 'day'),
                status: item.status as "Pending" | "Approved" | "Rejected",
                days_of_leave: String(dayjs(item.start_date).diff(item.end_date, 'day').toFixed(2)),
                approvedBy
            }
        })
    }, [data])
    SetNavEndContent(() => {

        return (<>
            <Button {...uniformStyle()}>
                Add New Plan
            </Button>
            {/*<RequestForm onOpen={setIsOpen} isOpen={isOpen}/>*/}
        </>)
    })
    return (<DataDisplay
        isLoading={isLoading}
        defaultDisplay="grid"
        data={benefitPlans}
        title="Leave Requests"
        filterProps={{
            filterItems: FilterItems
        }}
        // onTableDisplay={{
        //     config: TableConfigurations, layout: "auto"
        // }}
        searchProps={{
            searchingItemKey: ["name"]
        }}
        sortProps={{
            sortItems: [{
                name: "ID", key: "id"
            }]
        }}
        rowSelectionProps={{
            onRowChange: setRows
        }}
        paginationProps={{
            loop: true, data_length: data?.totalItems!, onChange: setPage
        }}
        // onListDisplay={(data) => {
        //     return (<BorderCard>{data.name}</BorderCard>)
        // }}
        onGridDisplay={(plan) => {
            return (<Card className="w-[270px] border-1" shadow="none">
                <CardHeader className="flex flex-col text-left">
                    <Typography className="flex items-center gap-2">
                        {/*<TypeIcon type={plan.type} />*/}
                        {plan.name}
                    </Typography>
                    <Typography className="text-sm text-default-400/50">{plan.description}</Typography>
                </CardHeader>
                <CardBody>
                    <Chip color="secondary" className="mb-2">{plan.type}</Chip>
                    <p className="text-sm mb-2">{plan.coverageDetails}</p>
                    <div className="flex justify-between items-center mt-4">
                        <Button variant="bordered" size="sm" onClick={() => alert(plan)}>
                            View Details
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            ${plan.employeeContribution}/mo
                        </div>
                    </div>
                </CardBody>
            </Card>)
        }}
    />);
}

export default PlansDataDisplay;