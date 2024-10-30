import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { PayslipData, PayslipEmployee, PayslipPayhead } from "@/types/payroll/payrollType";
import React, { useCallback, useRef, useState } from "react";
import CustomInput from "./input";
import { UserEmployee } from "@/helper/include-emp-and-reviewr/include";

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
  const [records, setRecords] = useState<Record<number,Record<number,['earning'|'deduction', number]>>>({})
  const handleBlur = (employeeId: number, payheadId: number, value: number) => {
    console.log(employeeId, payheadId, value)
    // API call logic here, using employeeId, payheadId, and value
  };

  function isAffected(employee: PayslipEmployee, payhead: PayslipPayhead){
    let mandatory = false
    // Find mandatory level...
    // if(payhead.affected_json.mandatory.probationary || payhead.affected_json.mandatory.regular){
    //   mandatory = true;
    //    Probi and Regu not yet implemented
    // }
    if(payhead.affected_json.department.length){
      mandatory = true;
      if(!payhead.affected_json.department.includes(employee.ref_departments.id)){
        return false;
      }
    }
    if(payhead.affected_json.job_classes.length){
      mandatory = true;
      if(!payhead.affected_json.job_classes.includes(employee.ref_job_classes.id)){
        return false;
      }
    }
    if (mandatory) return true;

    // If not mandatory, find if affected...
    return employee.dim_payhead_affecteds.some(affect => affect.payhead_id === payhead.id);
  }


  function handleRecording(employeeId: number, payheadId: number, value: ['earning'|'deduction', number]) {
    setRecords((prevRecords) => ({
      ...prevRecords,
      [employeeId]: {
        ...prevRecords[employeeId],
        [payheadId]: value,
      },
    }));
  }

  function getEmployeePayheadSum(employeeId: number, type: 'earning'|'deduction'): number {
    const employeeRecords = records[employeeId];
    if (!employeeRecords) return 0;
  
    return Object.values(employeeRecords).reduce((sum, payheadValue) => sum + (payheadValue[0]===type? payheadValue[1]:0), 0);
  }
  


  return (
    <table
      ref={tableRef}
      className="w-auto h-full table-fixed divide-y divide-gray-200"
    >
      <thead className="text-xs text-gray-500 sticky top-0 z-50">
        <tr className="divide-x divide-gray-200">
          <th className="sticky top-0 left-0 bg-gray-100 font-bold px-4 py-2 text-left w-[200px] max-w-[200px] z-50">
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
              key={'total-earn'} 
              className="sticky top-0 bg-blue-300 font-bold px-4 py-2 text-center capitalize z-40"
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
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 h-fit overflow-auto">
        {employees.map((employee) => (
          <tr
            className="divide-x"
            key={employee.id}
            onFocus={() => setFocusedEmployee(employee.id)}
          >
            <td className="sticky left-0 bg-gray-50 truncate text-sm font-semibold w-[200px] max-w-[200px] z-40">
              {getEmpFullName(employee)}
            </td>
            {earnings.map((earn) => (
              isAffected(employee, earn) ? <td
                key={earn.id}
                className="z-30"
                onFocus={() => setFocusedPayhead(earn.id)}
              >
                <CustomInput
                  placeholder={"0"}
                  onFocus={() => setFocusedPayhead(earn.id)}
                  onBlur={(e) => {
                    handleBlur(employee.id, earn.id, parseFloat(e.target.value)||0)
                  }}
                  value={String(records[employee.id]?.[earn.id] || "0")}
                  onChange={(e)=> {
                    handleRecording(employee.id, earn.id, ['earning',parseFloat(e.target.value)||0])
                  }}
                  readOnly={isProcessed}
                />
              </td>
              : <td className="text-sm text-gray-300 p-2 z-30">N/A</td>
            ))}
            <CustomInput
              placeholder={"0"}
              value={getEmployeePayheadSum(employee.id, 'earning')}
              readOnly={isProcessed}
            />
            {deductions.map((deduct) => (
              isAffected(employee, deduct) ? <td
                key={deduct.id}
                className="z-30"
                onFocus={() => setFocusedPayhead(deduct.id)}
              >
                <CustomInput
                  placeholder={"0"}
                  onFocus={() => setFocusedPayhead(deduct.id)}
                  onBlur={(e) => {
                    handleBlur(employee.id, deduct.id, parseFloat(e.target.value)||0)
                  }}
                  value={String(records[employee.id]?.[deduct.id] || "0")}
                  onChange={(e)=> {
                    handleRecording(employee.id, deduct.id, ['deduction', parseFloat(e.target.value)||0])
                  }}
                  readOnly={isProcessed}
                />
              </td>
              : <td className="text-sm text-gray-300 p-2 z-30">N/A</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
