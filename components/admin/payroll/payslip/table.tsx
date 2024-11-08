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
import { toGMT8 } from "@/lib/utils/toGMT8";
import { cn, Spinner } from "@nextui-org/react";
import {
  loadFromSession,
  removeFromSession,
  saveToSession,
} from "@/lib/utils/sessionStorage";
import { useQuery } from "@/services/queries";
import { viewPayslipType } from "@/app/(admin)/(core)/payroll/payslip/page";

interface PRPayslipTableType {
  processDate: ProcessDate;
  // setFocusedEmployee: (id: number | null) => void;
  // setFocusedPayhead: (id: number | null) => void;
  setPayslip: (item: viewPayslipType) => void;
}
export function PRPayslipTable({
  processDate,
  // setFocusedEmployee,
  // setFocusedPayhead,
  setPayslip,
}: PRPayslipTableType) {
  const cacheKey = "unpushedPayrollBatch";
  const cachedUnpushed = loadFromSession<batchDataType>(cacheKey);
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
  const [onErrors, setOnErrors] = useState(0);
  const [onRetry, setOnRetry] = useState(false);
  const { data: payslipData, isLoading } = useQuery<PayslipData>(
    (() => {
      if (!cachedUnpushed && processDate) {
        if (processDate.is_processed)
          return `/api/admin/payroll/payslip/get-processed?date=${processDate.id}`;
        else
          return `/api/admin/payroll/payslip/get-unprocessed?date=${processDate.id}`;
      }
      return null;
    })()
  );
  const requestQueue: {
    employeeId: number;
    payheadId: number;
    value: number;
  }[] = [];
  const dontInput = useMemo(() => {
    return processDate.is_processed || onErrors > 0 || onRetry;
  }, [processDate]);

  // Function to process update requests in the queue
  const processQueue = useCallback(async () => {
    if (payslipData) {
      while (requestQueue.length > 0) {
        const { employeeId, payheadId, value } = requestQueue.shift()!;
        if (!onErrors) {
          const payroll = payslipData.payrolls.find(
            (pr) => pr.employee_id === employeeId
          );
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
          } catch (error) {
            if (!onErrors) {
              setOnErrors(1);
            }
          }
        }
      }
    }
  }, [onErrors, payslipData, requestQueue]);

  // Add to queue and start processing if it's the first request
  const handleBlur = (employeeId: number, payheadId: number, value: number) => {
    if (processDate.is_processed) return;
    if (willUpdate) {
      requestQueue.push({ employeeId, payheadId, value });
      if (requestQueue.length === 1) processQueue();
      setWillUpdate(false);
    }
  };

  const batchData = useMemo(() => {
    if (payslipData) {
      const result = Object.entries(records).flatMap(([employee, payheads]) => {
        return Object.entries(payheads).map(([payheadId, details]) => {
          const payroll = payslipData.payrolls.find(
            (pr) => pr.employee_id === Number(employee)
          );
          const breakdown = payslipData.breakdowns.find(
            (bd) =>
              bd.payhead_id === Number(payheadId) &&
              bd.payroll_id === payroll?.id
          );
          return {
            payroll_id: payroll?.id, // Use optional chaining
            payhead_id: parseInt(payheadId),
            amount: parseFloat(details[1]),
            created_at: breakdown?.created_at || toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
          };
        });
      });

      return result;
    }

    return [];
  }, [records, payslipData]);

  type batchDataType = typeof batchData;

  const updateDataOnError = useCallback(
    async (items: batchDataType) => {
      await axios.post("/api/admin/payroll/payslip/update-batch", items);
      // If whole batch is reupdated, remove red flags
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
    },
    [records]
  );

  useEffect(() => {
    if (onErrors > 0) {
      if (onErrors < 10) {
        try {
          updateDataOnError(batchData);
        } catch (error) {
          setTimeout(() => setOnErrors((prev) => prev + 1), 1000); // Adjust the delay as needed
        }
      } else {
        saveToSession(cacheKey, batchData); // Save to session storage
      }
    }
  }, [onErrors, updateDataOnError, batchData]);

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

  const isSystemPayheadAffected = useMemo(()=>{
    return (employeeId: number, itemId: number): boolean => {
      if (!payslipData) return false;

      const employeeAmounts = payslipData?.calculatedAmountList?.[employeeId];
      if (!employeeAmounts) return false;

      const item = employeeAmounts.find((entry) => entry.id === itemId);
      return !!item;
    };
  },[payslipData])

  const getFormulatedAmount = useMemo(() => {
    return (employeeId: number, itemId: number): number => {
      if (!payslipData) return 0;

      const employeeAmounts = payslipData?.calculatedAmountList?.[employeeId];
      if (!employeeAmounts) return 0;

      const item = employeeAmounts.find((entry) => entry.id === itemId);
      return item ? item.amount : 0;
    };
  }, [payslipData]);

  const handleFocuses = useCallback((empID: number)=>{
    type ListItem = { label: string; number: string };
    const employeeRecords = records[empID];
    const earnings: ListItem[] = [];
    const deductions: ListItem[] = [];
    // console.log(employeeRecords);

    const earningNames = new Map(payslipData?.earnings.map(earn=>[earn.id, earn.name]))
    const deductionNames = new Map(payslipData?.deductions.map(deduct=>[deduct.id, deduct.name]))
    Object.entries(employeeRecords).forEach(([payheadID, [type, amount]]) => {
      if (type === "earning") {
        const item: ListItem = { label: earningNames.get(Number(payheadID))!, number: amount };
        earnings.push(item);
      } else if (type === "deduction") {
        const item: ListItem = { label: deductionNames.get(Number(payheadID))!, number: amount };
        deductions.push(item);
      }
    });
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
  },[setPayslip,records,payslipData])

  // Initial loaders
  useEffect(() => {
    if (cachedUnpushed) {
      setOnRetry(true);
      let retryCount = 0;
      const maxRetries = 10;
      const retryDelay = 3000; // 3 seconds
      async function push() {
        try {
          await updateDataOnError(cachedUnpushed!);
          removeFromSession(cacheKey);
          // mutate(`/api/admin/payroll/payslip?date=${processDate.id}`);
          setOnRetry(false);
          console.log("Pushed");
        } catch {
          if (retryCount < maxRetries) {
            retryCount += 1;
            setTimeout(push, retryDelay); // Retry after a delay
          } else {
            console.error("Max retry limit reached, could not update data.");
          }
        }
      }
      push();
    } else if (payslipData) {
      if(processDate === lastProcessDateState){
        console.log("Unchanged date, will not reupdate...");
        return
      }
      setLastProcessDateState(processDate);
      console.log("Loaded");
      // console.log(payslipData.employees);
      const payrollMap = new Map(payslipData.payrolls.map(pr=> [pr.id, pr.employee_id]));
      const earningsSet = new Set(payslipData.earnings.map((e) => e.id));
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
  }, [cachedUnpushed, payslipData, processDate, lastProcessDateState]);

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

  if (isLoading || !payslipData) {
    return <Spinner label="Preparing..." className="w-full h-full" />;
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
                value={getEmployeePayheadSum(employee.id, "earning")}
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
                value={getEmployeePayheadSum(employee.id, "deduction")}
                readOnly
              />
              <PayrollInputColumn
                uniqueKey={`${employee.id}-total-salary`}
                key={`${employee.id}-total-salary`}
                className="bg-green-50"
                // setFocusedPayhead={setFocusedPayhead}
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
          onErrors && !onRetry ? "visible" : "invisible h-0"
        )}
      >
        {`No connection, reconnecting (${onErrors})...`}
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
        {`Restoring unpushed data...`}
      </div>
    </>
  );
}
