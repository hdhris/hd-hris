import { getEmpFullName } from "@/lib/utils/nameFormatter";
import {
  PayslipData,
  PayslipEmployee,
  PayslipPayhead,
} from "@/types/payroll/payrollType";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { PayrollInputColumn } from "./input";
import axios from "axios";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { cn } from "@nextui-org/react";

interface PRPayslipTableType extends PayslipData {
  isProcessed: boolean;
  setFocusedEmployee: (id: number | null) => void;
  setFocusedPayhead: (id: number | null) => void;
}
export function PRPayslipTable({
  isProcessed,
  setFocusedEmployee,
  setFocusedPayhead,
  ...payslipData
}: PRPayslipTableType) {
  const [willUpdate, setWillUpdate] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const [updatedPayhead, setUpdatedPayheadMap] = useState<Map<string, boolean>>(
    new Map()
  );
  const [records, setRecords] = useState<
    Record<number, Record<number, ["earning" | "deduction", string]>>
  >({});
  const [onErrors, setOnErrors] = useState(0);

  const requestQueue: {
    employeeId: number;
    payheadId: number;
    value: number;
  }[] = [];

  // Function to process requests in the queue
  const processQueue = async () => {
    while (requestQueue.length > 0) {
      const { employeeId, payheadId, value } = requestQueue.shift()!;
      if(!(onErrors>0)){
        const payroll = payslipData.payrolls.find((pr) => pr.employee_id === employeeId);
        try {
          console.log("Updating");
          await axios.post("/api/admin/payroll/payslip/update-payhead", {
            payroll_id: payroll?.id,
            payhead_id: payheadId,
            amount: value,
          });
          setUpdatedPayheadMap((prevMap) => {
            const newMap = new Map(prevMap);
            newMap.set(`${employeeId}:${payheadId}`, true);
            return newMap;
          });
        } catch (error) {
          if (!onErrors) {
            setOnErrors(1);
          }
        }
      }
    }
  };

  // Add to queue and start processing if it's the first request
  const handleBlur = (employeeId: number, payheadId: number, value: number) => {
    if (willUpdate) {
      requestQueue.push({ employeeId, payheadId, value });
      if (requestQueue.length === 1) processQueue();
      setWillUpdate(false);
    }
  };

  const reUpdateBatch = useCallback(async () => {
    if(onErrors > 0 && onErrors < 10){
      try {
        const result = Object.entries(records).flatMap(([employee, payheads]) => {
          return Object.entries(payheads).map(([payheadId, details]) => {
            const payroll = payslipData.payrolls.find(
              (pr) => pr.employee_id === Number(employee)
            )
            const breakdown = payslipData.breakdowns.find(
              bd=>bd.payhead_id===Number(payheadId) && bd.payroll_id===payroll?.id
            )
            return {
              payroll_id: payroll?.id, // Use optional chaining
              payhead_id: parseInt(payheadId),
              amount: parseFloat(details[1]),
              created_at: breakdown?.created_at,
              updated_at: toGMT8().toISOString(),
            };
          });
        });
  
        await axios.post("/api/admin/payroll/payslip/update-batch", result);
        // If whole batch is reupdated, remove reds
        Object.entries(records).forEach(([employee, payheads]) => {
          Object.entries(payheads).forEach(([payheadId, details]) => {
            setUpdatedPayheadMap((prevMap) => {
              const newMap = new Map(prevMap);
              newMap.set(`${employee}:${payheadId}`, true);
              return newMap;
            });
          });
        });
        setOnErrors(0); // Reset error state on successful upload
      } catch (error) {
        setTimeout(() => setOnErrors(onErrors + 1), 3000); // Adjust the delay as needed
      }
    }
  }, [onErrors, records, payslipData]);

  useEffect(() => {
    reUpdateBatch();
  }, [reUpdateBatch]);

  // First loading
  useEffect(() => {
    if (payslipData.breakdowns) {
      console.log("First load")
      payslipData.breakdowns.forEach((bd) => {
        const payroll = payslipData.payrolls.find((pr) => pr.id === bd.payroll_id);
        handleRecording(
          payroll?.employee_id!,
          bd.payhead_id,
          [
            payslipData.earnings.find((e) => e.id === bd.payhead_id)
              ? "earning"
              : "deduction",
            bd.amount,
          ],
          true
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dont include payslipData.breakdowns, payslipData.payrolls, payslipData.earnings

  function isAffected(employee: PayslipEmployee, payhead: PayslipPayhead) {
    let mandatory = false;
    // Find mandatory level...
    // if(payhead.affected_json.mandatory.probationary || payhead.affected_json.mandatory.regular){
    //   mandatory = true;
    //    Probi and Regu not yet implemented
    // }
    if (payhead?.affected_json?.department?.length) {
      mandatory = true;
      if (
        !payhead.affected_json.department.includes(employee.ref_departments.id)
      ) {
        return false;
      }
    }
    if (payhead.affected_json.job_classes.length) {
      mandatory = true;
      if (
        !payhead.affected_json.job_classes.includes(employee.ref_job_classes.id)
      ) {
        return false;
      }
    }
    if (mandatory) return true;

    // If not mandatory, find if affected...
    return employee.dim_payhead_affecteds.some(
      (affect) => affect.payhead_id === payhead.id
    );
  }
  function handleRecording(
    employeeId: number,
    payheadId: number,
    value: ["earning" | "deduction", string],
    isAlreadyUpdated?: boolean
  ) {
    setRecords((prevRecords) => ({
      ...prevRecords,
      [employeeId]: {
        ...prevRecords[employeeId],
        [payheadId]: value,
      },
    }));
    console.log("Will update");
    setWillUpdate(!isAlreadyUpdated || true);
    setUpdatedPayheadMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(`${employeeId}:${payheadId}`, isAlreadyUpdated || false);
      return newMap;
    });
  }
  function getEmployeePayheadSum(
    employeeId: number,
    type: "earning" | "deduction"
  ): number {
    const employeeRecords = records[employeeId];
    if (!employeeRecords) return 0;

    return Object.values(employeeRecords).reduce(
      (sum, payheadValue) =>
        sum + parseFloat(payheadValue[0] === type ? payheadValue[1] : "0") || 0,
      0
    );
  }
  function getRecordAmount(employeeId: number, payheadId: number): string {
    return String(records[employeeId]?.[payheadId]?.[1] || "");
  }

  if (onErrors >= 10) {
    return (
      <div className="h-full w-full flex flex-col justify-center items-center">
        <h1 className="text-red-500 font-semibold">Request time out.</h1>
        <p className="text-gray-500 text-sm">
          Check your connection and refresh this page...
        </p>
      </div>
    );
  }

  return (
    <>
      <table
        ref={tableRef}
        className="w-auto h-full table-fixed divide-y divide-gray-200"
      >
        <thead className="text-xs text-gray-500 sticky top-0 z-50">
          <tr className="divide-x divide-gray-200">
            <th
              key={"name"}
              className="sticky top-0 left-0 bg-gray-100 font-bold px-4 py-2 text-left w-[200px] max-w-[200px] z-50"
            >
              NAME
            </th>
            {payslipData.earnings.map((earn) => (
              <th
                key={earn.id}
                className="sticky top-0 bg-[#f4f4f5] font-bold px-4 py-2 text-center capitalize z-40"
              >
                {earn.name}
              </th>
            ))}
            <th
              key={"total-earn"}
              className="sticky top-0 bg-blue-100 font-bold px-4 py-2 text-center capitalize z-40"
            >
              TOTAL EARNINGS
            </th>
            {payslipData.deductions.map((deduct) => (
              <th
                key={deduct.id}
                className="sticky top-0 bg-[#f4f4f5] font-bold px-4 py-2 text-center capitalize z-40"
              >
                {deduct.name}
              </th>
            ))}
            <th
              key={"total-deduct"}
              className="sticky top-0 bg-red-100 font-bold px-4 py-2 text-center capitalize z-40"
            >
              TOTAL DEDUCTIONS
            </th>
            <th
              key={"total-salary"}
              className="sticky top-0 bg-green-100 font-bold px-4 py-2 text-center capitalize z-40"
            >
              SALARY
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 h-fit overflow-auto">
          {payslipData.employees.map((employee) => (
            <tr
              className="divide-x"
              key={employee.id}
              onFocus={() => setFocusedEmployee(employee.id)}
            >
              <td
                key={`${employee.id}-name`}
                className="sticky left-0 bg-white truncate text-sm font-semibold w-[200px] max-w-[200px] z-40"
              >
                {getEmpFullName(employee)}
              </td>
              {payslipData.earnings.map((earn) =>
                isAffected(employee, earn) ? (
                  <PayrollInputColumn
                    uniqueKey={`${employee.id}-${earn.id}`}
                    key={`${employee.id}-${earn.id}`}
                    employeeId={employee.id}
                    payheadId={earn.id}
                    setFocusedPayhead={setFocusedPayhead}
                    handleBlur={handleBlur}
                    type="earning"
                    handleRecording={handleRecording}
                    value={getRecordAmount(employee.id, earn.id)}
                    readOnly={isProcessed || onErrors > 0}
                    unUpdated={
                      updatedPayhead.get(`${employee.id}:${earn.id}`) != null &&
                      !updatedPayhead.get(`${employee.id}:${earn.id}`)
                    }
                  />
                ) : (
                  <td
                    key={`${employee.id}-${earn.id}`}
                    className="text-sm text-gray-300 p-2 z-30"
                  >
                    N/A
                  </td>
                )
              )}
              <PayrollInputColumn
                className="bg-blue-50"
                uniqueKey={`${employee.id}-total-earn`}
                key={`${employee.id}-total-earn`}
                setFocusedPayhead={setFocusedPayhead}
                handleBlur={handleBlur}
                value={getEmployeePayheadSum(employee.id, "earning")}
                readOnly
              />
              {payslipData.deductions.map((deduct) =>
                isAffected(employee, deduct) ? (
                  <PayrollInputColumn
                    uniqueKey={`${employee.id}-${deduct.id}`}
                    key={`${employee.id}-${deduct.id}`}
                    employeeId={employee.id}
                    payheadId={deduct.id}
                    setFocusedPayhead={setFocusedPayhead}
                    handleBlur={handleBlur}
                    type="deduction"
                    handleRecording={handleRecording}
                    value={getRecordAmount(employee.id, deduct.id)}
                    readOnly={isProcessed || onErrors > 0}
                    unUpdated={
                      updatedPayhead.get(`${employee.id}:${deduct.id}`) !=
                        null &&
                      !updatedPayhead.get(`${employee.id}:${deduct.id}`)
                    }
                  />
                ) : (
                  <td
                    key={`${employee.id}-${deduct.id}`}
                    className="text-sm text-gray-300 p-2 z-30"
                  >
                    N/A
                  </td>
                )
              )}
              <PayrollInputColumn
                uniqueKey={`${employee.id}-total-deduct`}
                key={`${employee.id}-total-deduct`}
                className="bg-red-50"
                setFocusedPayhead={setFocusedPayhead}
                handleBlur={handleBlur}
                value={getEmployeePayheadSum(employee.id, "deduction")}
                readOnly
              />
              <PayrollInputColumn
                uniqueKey={`${employee.id}-total-salary`}
                key={`${employee.id}-total-salary`}
                className="bg-green-50"
                setFocusedPayhead={setFocusedPayhead}
                handleBlur={handleBlur}
                value={
                  getEmployeePayheadSum(employee.id, "earning") -
                  getEmployeePayheadSum(employee.id, "deduction")
                }
                readOnly
              />
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className={cn(
          "bg-red-100 border-red-500 text-red-500",
          "rounded-md border-2 p-2 text-tiny",
          "sticky bottom-0 left-0 z-50",
          "transition-all ease-in-out",
          onErrors ? "visible" : "invisible h-0"
        )}
      >
        {`Low connection, reconnecting (${onErrors})...`}
      </div>
    </>
  );
}
