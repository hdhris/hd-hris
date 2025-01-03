import { getEmpFullName } from "@/lib/utils/nameFormatter";
import {
  PayslipData,
  ProcessDate,
} from "@/types/payroll/payrollType";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PayrollInputColumn } from "./input";
import axios from "axios";
import { cn, Spinner } from "@nextui-org/react";
import {numberWithCommas} from "@/lib/utils/numberFormat";
import { axiosInstance } from "@/services/fetcher";
import useSWR from "swr";
import { stageTable } from "@/app/(admin)/(core)/payroll/payslip/stage";
import { static_formula, VariableAmountProp } from "@/helper/payroll/calculations";
import {ViewPayslipType, systemPayhead} from "@/types/payslip/types";

interface PRPayslipTableType {
  processDate: ProcessDate;
  // setFocusedEmployee: (id: number | null) => void;
  // setFocusedPayhead: (id: number | null) => void;
  setPayslip: (item: ViewPayslipType | null) => void;
  setAllPayslip: (item: ViewPayslipType[]) => void;
  setTobeDeployed: (item: unknown) => void;
}
export function PRPayslipTable({
  processDate,
  // setFocusedEmployee,
  // setFocusedPayhead,
  setTobeDeployed,
  setPayslip,
  setAllPayslip,
}: PRPayslipTableType) {
  // const cacheKey = "unpushedPayrollBatch";
  // const cachedUnpushed = loadFromSession<batchDataType>(cacheKey);
  const tableRef = useRef<HTMLTableElement>(null);
  const [willUpdate, setWillUpdate] = useState(false);
  const [lastProcessDateState, setLastProcessDateState] = useState({
    id: -1,
    is_processed: false,
  });
  const [updatedPayhead, setUpdatedPayheadMap] = useState<Map<string, boolean>>(
    new Map()
  );
  const [records, setRecords] = useState<
    Record<number, Record<number, ["earning" | "deduction", string]>>
  >({});
  const [stageMsg, setStageMsg] = useState("Preparing...");
  // const [onErrors, setOnErrors] = useState(false);
  const [onRetry, setOnRetry] = useState(false);
  // const [trialCount, setTrialCount] = useState(0);
  const fetcher = async (url: string | null) => {
    if(url){
      if (url?.includes('unprocessed')) {
        setStageMsg("Initializing employees' payroll...");
        const stage_one = await axios.post('/api/admin/payroll/payslip/get-unprocessed', { dateID: processDate.id, stageNumber: 1 });
        const { payrolls, employees, dataPH } = stage_one.data.result;
        const final_stage =  await stageTable(processDate, {payrolls, employees, dataPH}, setStageMsg);
        return final_stage;
      } else {
        // Fetch from the provided API URL
        setStageMsg("Loading...");
        return axiosInstance.get(url).then((res) => res.data);
      }
    }
  };
  const { data: payslipData, isLoading } = useSWR<PayslipData>(
    (() => {
      // if (!cachedUnpushed && processDate) {
      if (processDate) {
        if (processDate.is_processed)
          return `/api/admin/payroll/payslip/get-processed?date=${processDate.id}`;
        else
          return `/api/admin/payroll/payslip/get-unprocessed?date=${processDate.id}`;
      }
      return null;
    })(),
    fetcher,
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      // revalidateOnMount: false,
      revalidateOnReconnect: false,
    }
  );
  const requestQueue: {
    employeeId: number;
    payheadId: number;
    value: number;
  }[] = [];
  
  const dontInput = useMemo(() => {
    return processDate.is_processed || onRetry; // || onErrors || onRetry;
  }, [processDate, onRetry]);
  // }, [processDate, onErrors, onRetry]);

  // Function to process update requests in the queue
  const processQueue = useCallback(async () => {
    if (payslipData) {
      while (requestQueue.length > 0) {
        const { employeeId, payheadId, value } = requestQueue.shift()!;
        // if (!onErrors) {
          const payroll = payslipData.payrolls.find(
            (pr) => pr.employee_id === employeeId
          );
          async function push(){
            try {
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
              setOnRetry(false);
            } catch (error) {
              setOnRetry(true);
              setTimeout(push, 3000);
            }
          };
          push();
        // }
      }
    }
  }, [payslipData, requestQueue]);

  // Add to queue and start processing if it's the first request
  const handleBlur = (employeeId: number, payheadId: number, value: number) => {
    if (processDate.is_processed) return;
    if (willUpdate) {
      requestQueue.push({ employeeId, payheadId, value });
      if (requestQueue.length === 1) processQueue();
      setWillUpdate(false);
    }
  };

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
    console.log("Value changed");
    setWillUpdate(!isAlreadyUpdated || true);
    setUpdatedPayheadMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(`${employeeId}:${payheadId}`, isAlreadyUpdated || false);
      return newMap;
    });
  }

  const getRecordAmount = useMemo(() => {
    return (employeeId: number, payheadId: number): string | null => {
      const breakdown = records[employeeId];
      if(!breakdown) return null;

      const payhead = breakdown[payheadId];
      if(!payhead) return null;
      return payhead[1];
    };
  }, [records]);


  const getEmployeePayheadSum = useMemo(() => {
    return (employeeId: number, type: "earning" | "deduction"): number => {
      const employeeRecords = records[employeeId];
      if (!employeeRecords) return 0;

      return Object.values(employeeRecords).reduce(
        (sum, payheadValue) =>
          sum + parseFloat(payheadValue[0] === type ? payheadValue[1] : "0") ||
          0,
        0
      );
    };
  }, [records]);

  // const isSystemPayheadAffected = useMemo(()=>{
  //   return (employeeId: number, itemId: number): boolean => {
  //     if (!payslipData) return false;

  //     const employeeAmounts = payslipData?.calculatedAmountList?.[employeeId];
  //     if (!employeeAmounts) return false;

  //     const item = employeeAmounts.find((entry) => entry.payhead_id === itemId);
  //     return !!item;
  //   };
  // },[payslipData])

  const getFormulatedAmount = useMemo(() => {
    return (employeeId: number, itemId: number): number => {
      if (!payslipData) return 0;

      const employeeAmounts = payslipData?.calculatedAmountList?.[employeeId];
      if (!employeeAmounts) return 0;

      const item = employeeAmounts.find((entry) => entry.payhead_id === itemId);
      return item ? item.amount : 0;
    };
  }, [payslipData]);

  const toBeDeployed = useMemo(() => {
    const cashToDisburse: systemPayhead[] = [];
    const cashToRepay: systemPayhead[] = [];
    const benefitContribution: systemPayhead[] = [];

    if (!processDate.is_processed && payslipData && Object.keys(records).length) {    
      const remappedCalculatedAmountList =  new Map(
          Object.entries(payslipData.calculatedAmountList).map(([empId, variableAmountProps]) => [
            empId,
            new Map(
              variableAmountProps.map(item=>{
                return [item.payhead_id,
                { link_id: item.link_id, amount: item.amount }]
              })
            ),
          ])
        );

      const payrollIdMap = new Map(payslipData.payrolls.map((pr) => [pr.employee_id, pr.id]));
      const payheadCalMap = new Map([...payslipData.earnings, ...payslipData.deductions].map((ph) => [ph.id, ph.calculation]));
      Object.entries(records).forEach(([employee, payheads]) => {
        
        const calculatedData = remappedCalculatedAmountList.get(employee);
        if(calculatedData){
          const employeePayheads = remappedCalculatedAmountList.get(employee);
          Object.entries(payheads).forEach(([payheadId, details]) => {
            if(employeePayheads){
              const payhead = employeePayheads.get(Number(payheadId));
              if(payhead){
                if(payhead.link_id){
                  const newData = {
                    link_id: payhead.link_id,
                    amount: parseFloat(details[1]),
                    payroll_id: payrollIdMap.get(Number(employee))!,
                  }
                  if(payheadCalMap.get(Number(payheadId)) === static_formula.cash_advance_disbursement){
                    cashToDisburse.push(newData);

                  } else if(payheadCalMap.get(Number(payheadId)) === static_formula.cash_advance_repayment){
                    cashToRepay.push(newData);

                  } else if(payheadCalMap.get(Number(payheadId)) === static_formula.benefit_contribution){
                    benefitContribution.push(newData);
                  }
                }
              }
            }
          });
          
        }
      });
    }

    return {cashToDisburse,cashToRepay,benefitContribution};
  }, [payslipData, records, processDate]);

  useEffect(()=>{
    if(setTobeDeployed && toBeDeployed){
      setTobeDeployed(toBeDeployed);
    }
  },[toBeDeployed, setTobeDeployed])

  const handleFocuses = useCallback((empID: number)=>{
    if (isLoading){
      setPayslip(null);
      return;
    }
    type ListItem = { label: string; number: string };
    const employeeRecords = records[empID];
    const earnings: ListItem[] = [];
    const deductions: ListItem[] = [];
    // console.log(employeeRecords);

    const earningNames = new Map(payslipData?.earnings.map(earn=>[earn.id, earn.name]))
    const deductionNames = new Map(payslipData?.deductions.map(deduct=>[deduct.id, deduct.name]));
    if(employeeRecords){
      Object.entries(employeeRecords).forEach(([payheadID, [type, amount]]) => {
        if (type === "earning") {
          const item: ListItem = { label: earningNames.get(Number(payheadID))!, number: amount };
          earnings.push(item);
        } else if (type === "deduction") {
          const item: ListItem = { label: deductionNames.get(Number(payheadID))!, number: amount };
          deductions.push(item);
        }
      });
    }
    setPayslip((() => {
      const employee = payslipData?.employees.find(emp => emp.id === empID)!;
    
      return {
        data: {
          name: getEmpFullName(employee),
          role: employee.ref_job_classes.name,
        },
        earnings: {
          total: getEmployeePayheadSum(employee.id, "earning"),
          list: earnings,
        },
        deductions: {
          total: getEmployeePayheadSum(employee.id, "deduction"),
          list: deductions,
        },
        net: getEmployeePayheadSum(employee.id, "earning") - getEmployeePayheadSum(employee.id, "deduction"),
      }
    })()); 
  },[setPayslip,records,payslipData, isLoading]);

  useEffect(() => {
      const payslips: ViewPayslipType[] = [];

      if (!isLoading && payslipData?.employees) {
          payslipData?.employees.forEach((employee) => {
              type ListItem = { label: string; number: string };
              const employeeRecords = records[employee.id];
              const earnings: ListItem[] = [];
              const deductions: ListItem[] = [];
              // console.log(employeeRecords);

              const earningNames = new Map(payslipData?.earnings.map((earn) => [earn.id, earn.name]));
              const deductionNames = new Map(payslipData?.deductions.map((deduct) => [deduct.id, deduct.name]));
              if (employeeRecords) {
                  Object.entries(employeeRecords).forEach(([payheadID, [type, amount]]) => {
                      if (type === "earning") {
                          const item: ListItem = { label: earningNames.get(Number(payheadID))!, number: amount };
                          earnings.push(item);
                      } else if (type === "deduction") {
                          const item: ListItem = { label: deductionNames.get(Number(payheadID))!, number: amount };
                          deductions.push(item);
                      }
                  });
              }

              payslips.push({
                  data: {
                      name: getEmpFullName(employee),
                      role: employee.ref_job_classes.name,
                  },
                  earnings: {
                      total: getEmployeePayheadSum(employee.id, "earning"),
                      list: earnings,
                  },
                  deductions: {
                      total: getEmployeePayheadSum(employee.id, "deduction"),
                      list: deductions,
                  },
                  net: getEmployeePayheadSum(employee.id, "earning") - getEmployeePayheadSum(employee.id, "deduction"),
              });
          });
      }
      setAllPayslip(payslips);
  }, [records, payslipData, isLoading, setAllPayslip]);

  // Initial loaders
  const [onDialog, setDialog] = useState(false);
  useEffect(() => {
    if (payslipData) {
      if(processDate === lastProcessDateState){
        console.log("Unchanged date, will not reupdate...");
        return
      }
      setLastProcessDateState(processDate);
      console.log("Loaded");
      // console.log(payslipData.employees);
      const payrollMap = new Map(payslipData.payrolls.map(pr=> [pr.id, pr.employee_id]));
      const earningsSet = new Set(payslipData.earnings.map((e) => e.id));
      setRecords({}); // Clear records
      payslipData.breakdowns.forEach((bd) => {
        handleRecording(
          payrollMap.get(bd.payroll_id)!,
          bd.payhead_id,
          [
            earningsSet.has(bd.payhead_id) ? "earning" : "deduction",
            bd.amount,
          ],
          true
        );
      });
    }
  }, [payslipData, processDate, lastProcessDateState, onDialog]);
  // }, [cachedUnpushed, payslipData, processDate, lastProcessDateState, onDialog]);

  // if (onErrors && trialCount >= 10) {
  //   return (
  //     <div className="h-full w-full flex flex-col justify-center items-center">
  //       <h1 className="text-red-500 font-semibold">Request time out.</h1>
  //       <p className="text-gray-500 text-sm">
  //         Check your connection and refresh this page...
  //       </p>
  //     </div>
  //   );
  // }

  if (isLoading || !payslipData || !Object.keys(records).length) {
    return <Spinner label={stageMsg} className="w-full h-full" />;
  }

  return (
    <>
      <table
        ref={tableRef}
        className="w-auto h-full table-fixed divide-y divide-gray-200"
      >
        <thead className="text-xs text-gray-500 sticky top-0 z-50 h-11">
          <tr className="divide-x divide-gray-200">
            <th
              key={"id"}
              className="sticky top-0 left-0 bg-gray-100 font-bold px-4 py-2 text-left w-[50px] max-w-[50px] z-50"
            >
              ID
            </th>
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
              onFocus={() => handleFocuses(employee.id)}
            >
              <td
                key={`${employee.id}-id`}
                className="sticky left-0 bg-white truncate text-sm font-semibold w-[50px] max-w-[50px] z-40"
              >
                {employee.id}
              </td>
              <td
                key={`${employee.id}-name`}
                className="sticky left-0 bg-white truncate text-sm font-semibold w-[200px] max-w-[200px] z-40"
              >
                {getEmpFullName(employee)}
              </td>
              {payslipData.earnings.map((earn) =>
                // (
                //   !processDate.is_processed
                //     ? earn.system_only
                //       ? isSystemPayheadAffected(employee.id, earn.id)
                //       : isAffected(employee, earn)
                //     : true
                // )
                getRecordAmount(employee.id, earn.id)!==null ? (
                  <PayrollInputColumn
                    placeholder={
                      earn.is_overwritable
                        ? String(getFormulatedAmount(employee.id, earn.id))
                        : "0"
                    }
                    uniqueKey={`${employee.id}-${earn.id}`}
                    key={`${employee.id}-${earn.id}`}
                    employeeId={employee.id}
                    payheadId={earn.id}
                    // setFocusedPayhead={setFocusedPayhead}
                    handleBlur={handleBlur}
                    type="earning"
                    handleRecording={handleRecording}
                    value={getRecordAmount(employee.id, earn.id)!}
                    readOnly={dontInput || !earn.is_overwritable}
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
                // setFocusedPayhead={setFocusedPayhead}
                handleBlur={handleBlur}
                value={numberWithCommas(getEmployeePayheadSum(employee.id, "earning"))}
                readOnly
              />
              {payslipData.deductions.map((deduct) =>
                // (
                //   !processDate.is_processed
                //     ? deduct.system_only
                //       ? isSystemPayheadAffected(employee.id, deduct.id)
                //       : isAffected(employee, deduct)
                //     : true
                // )
                getRecordAmount(employee.id, deduct.id)!==null ? (
                  <PayrollInputColumn
                    placeholder={
                      deduct.is_overwritable
                        ? String(getFormulatedAmount(employee.id, deduct.id))
                        : "0"
                    }
                    uniqueKey={`${employee.id}-${deduct.id}`}
                    key={`${employee.id}-${deduct.id}`}
                    employeeId={employee.id}
                    payheadId={deduct.id}
                    // setFocusedPayhead={setFocusedPayhead}
                    handleBlur={handleBlur}
                    type="deduction"
                    handleRecording={handleRecording}
                    value={getRecordAmount(employee.id, deduct.id)!}
                    readOnly={dontInput || !deduct.is_overwritable}
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
                // setFocusedPayhead={setFocusedPayhead}
                handleBlur={handleBlur}
                value={numberWithCommas(getEmployeePayheadSum(employee.id, "deduction"))}
                readOnly/>
              <PayrollInputColumn
                uniqueKey={`${employee.id}-total-salary`}
                key={`${employee.id}-total-salary`}
                className="bg-green-50"
                // setFocusedPayhead={setFocusedPayhead}
                handleBlur={handleBlur}
                value={
                  numberWithCommas(getEmployeePayheadSum(employee.id, "earning") -
                  getEmployeePayheadSum(employee.id, "deduction"))
                }
                readOnly
              />
            </tr>
          ))}
        </tbody>
      </table>
      {/* <div
        className={cn(
          "bg-red-100 border-red-500 text-red-500",
          "rounded-md border-2 p-2 text-tiny",
          "sticky bottom-0 left-0 z-50",
          "transition-all ease-in-out",
          onErrors && !onRetry ? "visible" : "invisible h-0"
        )}
      >
        {`No connection, reconnecting (${trialCount+1})...`}
      </div>
      <div
        className={cn(
          "bg-orange-100 border-orange-500 text-orange-500",
          "rounded-md border-2 p-2 text-tiny",
          "sticky bottom-0 left-0 z-50",
          "transition-all ease-in-out",
          onRetry ? "visible" : "invisible h-0"
        )}
      >
        {`Restoring unpushed data (${trialCount+1})...`}
      </div> */}
      <div
        className={cn(
          "bg-orange-100 border-orange-500 text-orange-500",
          "rounded-md border-2 p-2 text-tiny",
          "sticky bottom-0 left-0 z-50",
          "transition-all ease-in-out",
          onRetry ? "visible" : "invisible h-0"
        )}
      >
        {`Connection lost. Reconnecting...`}
      </div>
    </>
  );
}
