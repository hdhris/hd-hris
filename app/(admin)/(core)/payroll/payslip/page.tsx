"use client";
import {PRPayslipTable} from "@/components/admin/payroll/payslip/table";
import DatePickerPayroll from "@/components/admin/payroll/proccess/PayrollDatePicker";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {useUserInfo} from "@/lib/utils/getEmployeInfo";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {toGMT8} from "@/lib/utils/toGMT8";
import {Card, CardBody, CardFooter, CardHeader, cn, Spinner} from "@nextui-org/react";
import React, {useCallback, useMemo, useRef, useState} from "react";
import {numberWithCommas} from "@/lib/utils/numberFormat";
import axios from "axios";
import {toast} from "@/components/ui/use-toast";
import {ProcessDate} from "@/types/payroll/payrollType";
import {ViewPayslipType} from "@/types/payslip/types";
import {Button} from "@nextui-org/button";
import {LuPrinter} from "react-icons/lu";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {generatePDF} from "@/helper/generate-pdf/generatePDF";
import {useReactToPrint} from "react-to-print";

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
    const [allPayslip, setAllPayslip] = useState<ViewPayslipType[]>([]);
    const [processDate, setProcessDate] = useState<ProcessDate | false | undefined>();
    const userInfo = useUserInfo();
    const [toBeDeployed, setTobeDeployed] = useState<unknown>();
    const payslipRef = useRef<HTMLDivElement>(null);

    const print = useReactToPrint({
        contentRef: payslipRef,
        documentTitle: `Payslip ${toGMT8().format("YYYYMMDDhh:mm:ss")}`,
    })
    const deployNow = useCallback(async () => {
        if (toBeDeployed) {
            try {
                toast({title: "Deploying..."});
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
    const handlePrintAll = async () => {
        // const data = allPayslip.map((payslip) => ({
        //     date: `${toGMT8(!!processDate ? processDate?.start_date : "").format("MMMM D")}-${toGMT8(!!processDate ? processDate?.end_date : "").format("D, YYYY")}`,
        //     ...payslip,
        // }));

        print?.()
        // await generatePDF("/api/admin/payroll/payslip/print-all-payslip", data);
    };

    SetNavEndContent(() => (
        <>
            <DatePickerPayroll setProcessDate={setProcessDate} onDeploy={deployNow}/>{" "}
            {/* <Button isIconOnly isDisabled={payslip === null} {...uniformStyle()} onPress={handlePrint}> */}
            <Button isIconOnly isDisabled={allPayslip.length === 0} {...uniformStyle()} onPress={handlePrintAll}>
                <LuPrinter className="size-5"/>
            </Button>
        </>
    ));

    const Divider = ({className: classes}: { className?: string }) => {
        return <div className={cn("w-full my-1 h-[1px] bg-gray-300", classes)}/>;
    };

    const payslipView = useMemo(() => {
        if (!processDate) {
            return (
                <div className="flex h-full w-full justify-center items-center">
                    <h1 className="text-gray-500 h-fit w-fit">
                        {processDate === undefined ? "" : "No Payroll Dates"}
                    </h1>
                </div>
            );
        }

        const payslipPages: ViewPayslipType[][] = [];
        for (let i = 0; i < allPayslip.length; i++) {
            const payslip = allPayslip[i];
            payslipPages.push([payslip, payslip]); // Duplicate payslip in one column
        }

        return (
            <div ref={payslipRef} className="print-container">
                {payslipPages.map((page, pageIndex) => (
                    <div
                        className="payslip-card even:border-t-2 border-dashed p-4 break-inside-avoid grid grid-cols-2 gap-4 w-full h-fit"
                        key={`page-${pageIndex}`}
                    >
                        {page.map((payslip, index) => (
                            <div className="payslip-card even:border-l-2 border-dashed p-4" key={`card-${index}`}>
                                <div className="flex flex-col items-center">
                                    <strong className="text-[8pt]">PAYSLIP</strong>
                                    <p className="text-gray-500 text-[8pt]">
                                        {new Date(processDate.start_date).toLocaleDateString()} -{" "}
                                        {new Date(processDate.end_date).toLocaleDateString()}
                                    </p>
                                    <p className="mt-2 font-semibold text-[8pt]">{payslip.data.name}</p>
                                    <p className="text-small text-gray-500 font-semibold text-[8pt]">{payslip.data.role}</p>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold text-[8pt]">Earnings</h3>
                                    {payslip.earnings.list.map((item, idx) => (
                                        <div key={`earn-${idx}`} className="flex justify-between">
                                            <span className="text-[8pt]">{item.label}:</span>
                                            <span className="text-[8pt]">{numberWithCommas(Number(item.number))}</span>
                                        </div>
                                    ))}
                                    <div className="font-bold text-[8pt] flex justify-between">Total: <span>{numberWithCommas(payslip.earnings.total)}</span></div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold text-[8pt]">Deductions</h3>
                                    {payslip.deductions.list.map((item, idx) => (
                                        <div key={`deduct-${idx}`} className="flex justify-between">
                                            <span className="text-[8pt]">{item.label}:</span>
                                            <span className="text-[8pt]">{numberWithCommas(Number(item.number))}</span>
                                        </div>
                                    ))}
                                    <div className="font-bold text-[8pt] flex justify-between">Total: <span>{numberWithCommas(payslip.deductions.total)}</span></div>
                                </div>
                                <div className="mt-4 font-bold text-[8pt] flex justify-between border-t-2">Net Pay: <span>₱{numberWithCommas(payslip.net)}</span></div>
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <p className="text-[8pt]">Prepared by:</p>
                                        <p className="text-[8pt]">{userInfo ? getEmpFullName(userInfo) : "Invalid user"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8pt]">Received by:</p>
                                        <p className="text-[8pt]">{payslip.data.name}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }, [allPayslip, processDate, userInfo]);

    if (processDate === undefined) {
        return <Spinner label="Loading..." className="w-full h-full"/>;
    }

    if (processDate === false) {
        return <div className="flex h-full w-full justify-center items-center">
            <h1 className="text-gray-500 h-fit w-fit">No Payroll Dates</h1>
        </div>;
    }


    return (<>
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
                                            {index < payslip.earnings.list.length - 1 && <Divider className="w-52"/>}
                                        </div>
                                    );
                                })}
                                <Divider/>
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
                                                {index < payslip.deductions.list.length - 1 &&
                                                    <Divider className="w-52"/>}
                                            </div>
                                        );
                                    })}
                                    <Divider/>
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
                                    <Divider/>
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
            {payslipView}
        </>

    );
}

export default Page;
