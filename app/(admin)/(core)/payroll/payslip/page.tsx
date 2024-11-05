"use client";
import { PRPayslipTable } from "@/components/admin/payroll/payslip/table";
import DatePickerPayroll from "@/components/admin/payroll/proccess/PayrollDatePicker";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { ProcessDate } from "@/types/payroll/payrollType";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  cn,
  Spinner,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";

function Page() {
  const [focusedEmployee, setFocusedEmployee] = useState<number | null>(null);
  const [focusedPayhead, setFocusedPayhead] = useState<number | null>(null);
  const [processDate, setProcessDate] = useState<ProcessDate>();
  SetNavEndContent(() => <DatePickerPayroll setProcessDate={setProcessDate} />);

  if (processDate === undefined) {
    return <Spinner label="Loading..." className="w-full h-full" />;
  }

  const data = {
    start_date: '2024-10-15T00:00:00.000Z',
    end_date: '2024-10-30T00:00:00.000Z',
    name: 'Michael Angelo Supetran',
    role: 'Sales Representative',
  }
  const lists = [
    {
      label: "No. of Days",
      number: "30",
      amount: "P 3,000",
    },{
      label: "Basic + COLA",
      number: "3000",
      amount: "P 5,000",
    },{
      label: "Overtime",
      number: "45hr",
      amount: "P 1,520",
    },
  ]

  const Divider = ({className:classes}:{className?:string})=>{
    return <div className={cn('w-full my-1 h-[1px] bg-gray-300',classes)} />
  }
  return (
    <div className="h-full flex gap-2">
      <div className="flex-1 overflow-auto m-2">
        <PRPayslipTable
          processDate={processDate}
          setFocusedEmployee={setFocusedEmployee}
          setFocusedPayhead={setFocusedPayhead}
        />
      </div>
      <Card className="w-80 h-auto m-2" shadow="sm">
        <CardHeader>
          <div className="w-full flex flex-col justify-center items-center">
            <strong>PAYSLIP</strong>
            <p className="text-gray-500 text-sm">{toGMT8(data.start_date).format('MMMM D')}-{toGMT8(data.end_date).format('D, YYYY')}</p>
            <p className="mt-2 font-semibold">{data.name}</p>
            <p className="text-small text-gray-500 font-semibold">{data.role}</p>
          </div>
        </CardHeader>
        <CardBody>
          {lists.map((item,index)=>{
            return(
              <div key={`earn-${index}`}>
                <div className="flex items-center">
                  <p className="w-32 flex justify-between text-sm font-semibold">{item.label}<span>:</span></p>
                  <p className="w-14 ms-5 flex justify-between text-sm font-semibold">{item.number}<span>:</span></p>
                  <p className="ps-4 text-sm font-bold">{item.amount}</p>
                </div>
                <Divider className="w-52"/>
              </div>
              )
            })}
          <Divider className="w-20 ms-auto h-[2px]"/>
          <div className="ms-4">
            <p className="text-sm font-semibold text-gray-500 my-2">Deduction</p>
            {lists.map((item, index)=>{
              return(
                <div key={`deduct-${index}`}>
                  <div className="flex items-center">
                    <p className="w-28 flex justify-between text-sm font-semibold">{item.label}<span>:</span></p>
                    <p className="w-14 ms-5 flex justify-between text-sm font-semibold">{item.number}<span>:</span></p>
                    <p className="ps-4 text-sm font-bold">{item.amount}</p>
                  </div>
                  <Divider className="w-48"/>
                </div>
                )
              })}
              <Divider className="w-20 ms-auto h-[2px]"/>
          </div>
          <div className="mt-5">
            <div className="flex items-center">
              <p className="w-32 flex justify-between text-sm font-semibold">Net Pay<span>:</span></p>
              <p className="w-14 ms-5 flex justify-between text-sm font-semibold">3000<span>:</span></p>
              <p className="ps-4 text-sm font-bold">P 11,250</p>
            </div>
            <Divider/>
          </div>
          {/* <h1>Focused Employee: {focusedEmployee}</h1>
          <h1>Focused Payhead: {focusedPayhead}</h1> */}
          {/* <h1>Payroll id: {data?.payrolls?.find(pr=>pr.employee_id===focusedEmployee)?.id}</h1> */}
        </CardBody>
        <CardFooter className="flex gap-2">
          <div>
            <p className="text-small text-gray-500">Prepared by:</p>
            <p className="text-small font-semibold">{data.name}</p>
          </div>
          <div>
            <p className="text-small text-gray-500">Received by:</p>
            <p className="text-small font-semibold">{data.name}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Page;
