"use client";
import { PRPayslipTable } from "@/components/admin/payroll/payslip/table";
import DatePickerPayroll from "@/components/admin/payroll/proccess/PayrollDatePicker";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import { useQuery } from "@/services/queries";
import { PayslipData, ProcessDate } from "@/types/payroll/payrollType";
import { Card, CardBody, CardFooter, CardHeader, Spinner } from "@nextui-org/react";
import React, { useState } from "react";

function Page() {
  const [focusedEmployee, setFocusedEmployee] = useState<number | null>(null);
  const [focusedPayhead, setFocusedPayhead] = useState<number | null>(null);
  const [processDate, setProcessDate] = useState<ProcessDate>();
  SetNavEndContent(() => (
    <DatePickerPayroll
      setProcessDate={setProcessDate}
    />
  ));
  const { data, isLoading } = useQuery<PayslipData>(`/api/admin/payroll/payslip?date=${processDate?.id}`);
  return (
    <div className="h-full flex gap-2">
      <div className="flex-1 overflow-auto m-2">
        {isLoading || (processDate===undefined) ? (
          <Spinner label="Loading..." className="w-full h-full"/>
        ) : (
          <PRPayslipTable
            setFocusedEmployee={setFocusedEmployee}
            setFocusedPayhead={setFocusedPayhead}
            isProcessed={processDate ? processDate.is_processed : true}
            payrolls={data?.payrolls || []}
            employees={data?.employees || []}
            earnings={data?.earnings || []}
            deductions={data?.deductions || []}
          />
        )}
      </div>
      <Card className="w-80 h-full m-2" shadow="sm">
        <CardHeader>Payslip</CardHeader>
        <CardBody>
          <h1>Focused Employee: {focusedEmployee}</h1>
          <h1>Focused Payhead: {focusedPayhead}</h1>
        </CardBody>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}

export default Page;
