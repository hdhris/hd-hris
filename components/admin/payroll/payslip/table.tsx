import { getEmpFullName } from "@/lib/utils/nameFormatter";
import {
  PayslipData,
  PayslipEmployee,
  PayslipPayhead,
} from "@/types/payroll/payrollType";
import React, { useRef, useState } from "react";
import { PayrollInputColumn } from "./input";

interface PRPayslipTableType extends PayslipData {
  isProcessed: boolean;
  setFocusedEmployee: (id: number | null) => void;
  setFocusedPayhead: (id: number | null) => void;
}
export function PRPayslipTable({
  employees,
  deductions,
  earnings,
  payrolls,
  isProcessed,
  setFocusedEmployee,
  setFocusedPayhead,
}: PRPayslipTableType) {

  const tableRef = useRef<HTMLTableElement>(null);
  const [records, setRecords] = useState<
    Record<number, Record<number, ["earning" | "deduction", string]>>
  >({});

  const handleBlur = (employeeId: number, payheadId: number, value: number) => {
    console.log(employeeId, payheadId, value);
    // API call logic here, using employeeId, payheadId, and value
  };

  function isAffected(employee: PayslipEmployee, payhead: PayslipPayhead) {
    let mandatory = false;
    // Find mandatory level...
    // if(payhead.affected_json.mandatory.probationary || payhead.affected_json.mandatory.regular){
    //   mandatory = true;
    //    Probi and Regu not yet implemented
    // }
    if (payhead.affected_json.department.length) {
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
    value: ["earning" | "deduction", string]
  ) {
    setRecords((prevRecords) => ({
      ...prevRecords,
      [employeeId]: {
        ...prevRecords[employeeId],
        [payheadId]: value,
      },
    }));
  }
  function getEmployeePayheadSum(employeeId: number, type: "earning" | "deduction"): number {
    const employeeRecords = records[employeeId];
    if (!employeeRecords) return 0;

    return Object.values(employeeRecords).reduce(
      (sum, payheadValue) =>
        sum + parseFloat(payheadValue[0] === type ? payheadValue[1] : "0")||0,
      0
    );
  }
  function getRecordAmount(employeeId: number, payheadId: number): string {
    return String(records[employeeId]?.[payheadId]?.[1] || "");
  }

  return (
    <table
      ref={tableRef}
      className="w-auto h-full table-fixed divide-y divide-gray-200"
    >
      <thead className="text-xs text-gray-500 sticky top-0 z-50">
        <tr className="divide-x divide-gray-200">
          <th key={'name'} className="sticky top-0 left-0 bg-gray-100 font-bold px-4 py-2 text-left w-[200px] max-w-[200px] z-50">
            NAME
          </th>
          {earnings.map((earn) => (
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
          {deductions.map((deduct) => (
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
        {employees.map((employee) => (
          <tr
            className="divide-x"
            key={employee.id}
            onFocus={() => setFocusedEmployee(employee.id)}
          >
            <td key={`${employee.id}-name`} className="sticky left-0 bg-white truncate text-sm font-semibold w-[200px] max-w-[200px] z-40">
              {getEmpFullName(employee)}
            </td>
            {earnings.map((earn) =>
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
                  readOnly={isProcessed}
                />
              ) : (
                <td key={`${employee.id}-${earn.id}`} className="text-sm text-gray-300 p-2 z-30">N/A</td>
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
            {deductions.map((deduct) =>
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
                  readOnly={isProcessed}
                />
              ) : (
                <td key={`${employee.id}-${deduct.id}`} className="text-sm text-gray-300 p-2 z-30">N/A</td>
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
  );
}
