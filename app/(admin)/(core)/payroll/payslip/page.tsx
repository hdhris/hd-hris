"use client";
import { PRPayslipTable } from "@/components/admin/payroll/payslip/table";
import DatePickerPayroll from "@/components/admin/payroll/proccess/PayrollDatePicker";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import { useUserInfo } from "@/lib/utils/getEmployeInfo";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { Card, CardBody, CardFooter, CardHeader, cn, Spinner } from "@nextui-org/react";
import React, { useCallback, useState } from "react";
import { numberWithCommas } from "@/lib/utils/numberFormat";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { ProcessDate } from "@/types/payroll/payrollType";
import { ViewPayslipType } from "@/types/payslip/types";
import { Button } from "@nextui-org/button";
import { LuPrinter } from "react-icons/lu";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { generatePDF } from "@/helper/generate-pdf/generatePDF";

//I already created a reusable interface

// const data = {
//   name: 'Michael Angelo Supetran',
//   role: 'Sales Representative',
// }
// const lists = [
//   {
//     label: "No. of Days",
//     number: "30",
//     // amount: "P 3,000",
//   },{
//     label: "Basic + COLA",
//     number: "3000",
//     // amount: "P 5,000",
//   },{
//     label: "Overtime",
//     number: "45hr",
//     // amount: "P 1,520",
//   },
// ]
//
// export type viewPayslipType = {
//   data: typeof data,
//   earnings: {
//     total: number,
//     list: typeof lists,
//   },
//   deductions: {
//     total: number,
//     list: typeof lists,
//   }
//   net: number;
// }
//
// export type systemPayhead = {
//   link_id: number;
//   amount: number;
//   payroll_id: number;
// }

function Page() {
    const [focusedEmployee, setFocusedEmployee] = useState<number | null>(null);
    const [focusedPayhead, setFocusedPayhead] = useState<number | null>(null);
    const [payslip, setPayslip] = useState<ViewPayslipType | null>(null);
    const [allpayslip, setAllPayslip] = useState<ViewPayslipType[]>([]);
    const [processDate, setProcessDate] = useState<ProcessDate | false | undefined>();
    const [toBeDeployed, setTobeDeployed] = useState<unknown>();
    const userInfo = useUserInfo();

    const deployNow = useCallback(async () => {
        if (toBeDeployed) {
            try {
                toast({ title: "Deploying..." });
                await axios.post("/api/admin/payroll/payslip/deploy-system-payheads", toBeDeployed);
            } catch (error) {
                console.error(error);
            }
        }
    }, [toBeDeployed]);
    const handlePrint = async () => {
        const data = {
            date: `${toGMT8(!!processDate ? processDate?.start_date : "").format("MMMM D")}-${toGMT8(
                !!processDate ? processDate?.end_date : ""
            ).format("D, YYYY")}`,
            ...payslip,
        };
        await generatePDF("/api/admin/payroll/payslip/print-payslip", data);
    };
    SetNavEndContent(() => (
        <>
            <DatePickerPayroll setProcessDate={setProcessDate} onDeploy={deployNow} />{" "}
            <Button isIconOnly isDisabled={payslip === null} {...uniformStyle()} onPress={handlePrint}>
                <LuPrinter className="size-5" />
            </Button>
        </>
    ));

    if (processDate === undefined) {
        return <Spinner label="Loading..." className="w-full h-full" />;
    }

    if (processDate === false) {
        return <div className="flex h-full w-full justify-center items-center">
          <h1 className="text-gray-500 h-fit w-fit">No Payroll Dates</h1>
        </div>;
    }

    const Divider = ({ className: classes }: { className?: string }) => {
        return <div className={cn("w-full my-1 h-[1px] bg-gray-300", classes)} />;
    };
    return (
        <div className="h-full flex gap-2">
            <div className="flex-1 overflow-auto m-2">
                <PRPayslipTable
                    processDate={processDate}
                    setPayslip={setPayslip}
                    setAllPayslip={setAllPayslip}
                    setTobeDeployed={setTobeDeployed}
                    // setFocusedEmployee={setFocusedEmployee}
                    // setFocusedPayhead={setFocusedPayhead}
                />
            </div>
            <Card className="w-80 h-auto m-2" shadow="sm">
                {payslip ? (
                    <>
                        <CardHeader>
                            <div className="w-full flex flex-col justify-center items-center">
                                <strong>PAYSLIP</strong>
                                <p className="text-gray-500 text-sm">
                                    {toGMT8(processDate.start_date).format("MMMM D")}-
                                    {toGMT8(processDate.end_date).format("D, YYYY")}
                                </p>
                                <p className="mt-2 font-semibold">{payslip.data.name}</p>
                                <p className="text-small text-gray-500 font-semibold">{payslip.data.role}</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            {payslip.earnings.list.map((item, index) => {
                                return (
                                    <div key={`earn-${index}`}>
                                        <div className="flex items-center">
                                            <p className="w-32 flex justify-between text-sm font-semibold">
                                                {item.label}
                                                <span>:</span>
                                            </p>
                                            <p className="w-14 ms-5 flex justify-between text-sm font-semibold">
                                                {numberWithCommas(Number(item.number))}
                                                <span>:</span>
                                            </p>
                                            {/* <p className="ps-4 text-sm font-bold">{item.amount}</p> */}
                                        </div>
                                        {index < payslip.earnings.list.length - 1 && <Divider className="w-52" />}
                                    </div>
                                );
                            })}
                            <Divider />
                            <p className="ms-auto me-4 text-small font-semibold">
                                {numberWithCommas(payslip.earnings.total)}
                            </p>
                            <div className="ms-4">
                                <p className="text-sm font-semibold text-gray-500 my-2">Deduction</p>
                                {payslip.deductions.list.map((item, index) => {
                                    return (
                                        <div key={`deduct-${index}`}>
                                            <div className="flex items-center">
                                                <p className="w-28 flex justify-between text-sm font-semibold">
                                                    {item.label}
                                                    <span>:</span>
                                                </p>
                                                <p className="w-14 ms-5 flex justify-between text-sm font-semibold">
                                                    {numberWithCommas(Number(item.number))}
                                                    <span>:</span>
                                                </p>
                                                {/* <p className="ps-4 text-sm font-bold">{item.amount}</p> */}
                                            </div>
                                            {index < payslip.deductions.list.length - 1 && <Divider className="w-52" />}
                                        </div>
                                    );
                                })}
                                <Divider />
                                <p className="w-fit ms-auto me-4 text-small font-semibold">
                                    {numberWithCommas(payslip.deductions.total)}
                                </p>
                            </div>
                            <div className="mt-5">
                                <div className="flex items-center">
                                    <p className="w-32 flex justify-between text-sm font-semibold">
                                        Net Pay<span>:</span>
                                    </p>
                                    {/* <p className="w-14 ms-5 flex justify-between text-sm font-semibold">{" "}<span>:</span>
                  </p> */}
                                </div>
                                <Divider />
                                <p className="w-fit ms-auto me-4 text-small font-bold">
                                    ₱ {numberWithCommas(payslip.net)}
                                </p>
                            </div>
                            {/* <h1>Focused Employee: {focusedEmployee}</h1>
          <h1>Focused Payhead: {focusedPayhead}</h1> */}
                            {/* <h1>Payroll id: {data?.payrolls?.find(pr=>pr.employee_id===focusedEmployee)?.id}</h1> */}
                        </CardBody>
                        <CardFooter className="flex gap-2 h-24">
                            <div className="w-1/2 h-full">
                                <p className="text-small text-gray-500">Prepared by:</p>
                                <p className="text-small font-semibold">
                                    {userInfo ? getEmpFullName(userInfo) : "Invalid user"}
                                </p>
                            </div>
                            <div className="w-1/2 h-full">
                                <p className="text-small text-gray-500">Received by:</p>
                                <p className="text-small font-semibold">{payslip.data.name}</p>
                            </div>
                        </CardFooter>
                    </>
                ) : (
                    <div className="w-full h-full grid place-content-center">Select a row to view details.</div>
                )}
            </Card>
        </div>
    );
}

export default Page;
