"use client";
import React, {useMemo, useRef, useState} from 'react';
import {usePayrollReport, usePayrollReportDate} from "@/services/queries";
import {PayrollBreakdownReport} from '@/types/report/payroll/payroll';
import BorderCard from "@/components/common/BorderCard";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {cn, Select, SelectItem} from "@nextui-org/react";
import NoData from "@/components/common/no-data/NoData";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {LuPrinter} from "react-icons/lu";
import {Button} from "@nextui-org/button";
import {useReactToPrint} from "react-to-print";
import {toGMT8} from "@/lib/utils/toGMT8";
import Loading from "@/components/spinner/Loading";

function PayrollReport() {
    const {data: payroll_date, isLoading: payroll_date_is_loading, error} = usePayrollReportDate()
    const [date_id, setDate_id] = useState<number>()
    // Memoize data to prevent unnecessary re-rendering

    const contentRef = useRef<HTMLDivElement>(null);

    const reactToPrintFn = useReactToPrint({
        contentRef,
        documentTitle: `Payroll Report ${toGMT8().format("YYYYMMDDhh:mm:ss")}`,
        onAfterPrint: () => console.log('Print finished'),
    });

    const printStyles = `
    @page {
        size: Legal landscape;  /* Ensures the content is printed in landscape orientation */
        margin: 20mm; /* Adjust margin if needed */
    }
    body {
        font-family: Arial, sans-serif;
        line-height: 1.5;
        margin: 0;
    }
    .print-container {
        width: 100%;
        overflow: hidden;
    }
    .print-container * {
        box-sizing: border-box;
    }
    /* Adjust the scaling if needed */
    @media print {
        .print-container {
            page-break-before: always;
            transform: scale(0.9);  /* Scale down the content to fit */
            transform-origin: top left;
            width: 100%;
        }
    }
`;

    const {data: report, isLoading} = usePayrollReport(date_id!);
    const data = useMemo(() => {
        if (report) {
            console.log(report)
            return {
                employees: report.employees || [],
                payroll: report.payroll || [],
                breakdown: report.breakdown || [],
                earnings: report.earnings || [],
                deductions: report.deductions || [],
                combined_payhead: report.combined_payhead || []
            };
        }
        return null
    }, [report]);

    const payroll_date_deployed = useMemo(() => {
        if (payroll_date) {
            console.log(payroll_date)
            return payroll_date
        }
    }, [payroll_date]);


    SetNavEndContent(() => {
        return (<div className="flex gap-2">
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
                <Button isIconOnly isDisabled={data?.employees.length === 0} {...uniformStyle()}
                        onPress={() => reactToPrintFn?.()}>
                    <LuPrinter className="size-5"/>
                </Button>
            </div>)
    })


    // Function to calculate total earnings
    const calculateEarnings = (breakdowns: PayrollBreakdownReport[]) => {
        return breakdowns
            .filter(b => data?.earnings.some(earn => earn.payhead_id === b.payhead_id))
            .reduce((sum, b) => sum + b.amount, 0);
    };

    // Function to calculate total deductions
    const calculateDeductions = (breakdowns: PayrollBreakdownReport[]) => {
        return breakdowns
            .filter(b => data?.deductions.some(deduc => deduc.payhead_id === b.payhead_id))
            .reduce((sum, b) => sum + b.amount, 0);
    };

    // Process payroll data to include earnings, deductions, and net pay
    const processedData = data?.payroll.map(payroll => {
        const employee = data.employees.find(e => e.id === payroll.employee_id);
        const breakdowns = data.breakdown.filter(b => b.payroll_id === payroll.payroll_id);
        const earnings = calculateEarnings(breakdowns);
        const deductions = calculateDeductions(breakdowns);
        const netPay = earnings - deductions;

        return {
            ...employee, earnings, deductions, netPay, breakdowns
        };
    });

    if (isLoading) {
        return <Loading/>;
    }

    return (<>
            <style>{printStyles}</style>
            <div className={cn("overflow-x-auto", "print-container print:p-5")} ref={contentRef}>
                {data?.employees?.length! > 0 ? <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left border text-[7pt]">Employee Name</th>
                        <th className="p-3 text-left border text-[7pt]">Department</th>
                        <th className="p-3 text-left border text-[7pt]">Position</th>
                        {data?.earnings.map((item, index) => (
                            <th key={index} className="p-3 text-right border text-[7pt]">{item.name}</th>))}
                        <th className="p-3 text-right border text-[7pt]">Gross Pay</th>
                        {data?.deductions.map((item, index) => (
                            <th key={index} className="p-3 text-right border text-[7pt]">{item.name}</th>))}
                        <th className="p-3 text-right border text-[7pt]">Deductions</th>
                        <th className="p-3 text-right border text-[7pt]">Net Pay</th>
                    </tr>
                    </thead>
                    <tbody>
                    {processedData?.map((employee) => (<tr key={employee.id} className="hover:bg-gray-50">
                            <td className="p-3 border text-[7pt]">{employee.name}</td>
                            <td className="p-3 border text-[7pt]">{employee.department}</td>
                            <td className="p-3 border text-[7pt]">{employee.job}</td>

                            {/* Earnings columns */}
                            {data?.earnings.map((earnItem) => {
                                const breakdown = employee.breakdowns.find(item => item.payhead_id === earnItem.payhead_id);
                                return (<td key={earnItem.payhead_id} className="p-3 text-right border text-[7pt]">
                                        ₱{breakdown?.amount?.toLocaleString(undefined, {
                                        minimumFractionDigits: 2, maximumFractionDigits: 2
                                    }) ?? 0}
                                    </td>);
                            })}

                            <td className="p-3 text-right border text-[7pt] font-semibold">
                                ₱{employee.earnings.toLocaleString(undefined, {
                                minimumFractionDigits: 2, maximumFractionDigits: 2
                            })}
                            </td>

                            {/* Deductions columns */}
                            {data?.deductions.map((deducItem) => {
                                const breakdown = employee.breakdowns.find(item => item.payhead_id === deducItem.payhead_id);
                                return (<td key={deducItem.payhead_id} className="p-3 text-right border text-[7pt]">
                                        ₱{breakdown?.amount?.toLocaleString(undefined, {
                                        minimumFractionDigits: 2, maximumFractionDigits: 2
                                    }) ?? 0}
                                    </td>);
                            })}

                            <td className="p-3 text-right border text-[7pt] font-semibold">
                                ₱{employee.deductions.toLocaleString(undefined, {
                                minimumFractionDigits: 2, maximumFractionDigits: 2
                            })}
                            </td>

                            <td className="p-3 text-right border text-[7pt] font-semibold">
                                ₱{employee.netPay.toLocaleString(undefined, {
                                minimumFractionDigits: 2, maximumFractionDigits: 2
                            })}
                            </td>
                        </tr>))}
                    </tbody>
                </table> : <NoData/>}
            </div>
        </>

    );
}

export default PayrollReport;
