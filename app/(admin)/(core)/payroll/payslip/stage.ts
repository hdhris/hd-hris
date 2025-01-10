import { isAffected } from "@/components/admin/payroll/payslip/util";
import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { tryParse } from "@/helper/objects/jsonParserType";
import {
  BaseValueProp,
  Benefit,
  calculateAllPayheads,
  ContributionSetting,
  getAttendanceTotal,
  static_formula,
  VariableAmountProp,
  VariableFormulaProp,
} from "@/helper/payroll/calculations";
import { toGMT8 } from "@/lib/utils/toGMT8";
import {
  Breakdown,
  Payroll,
  PayslipData,
  PayslipPayhead,
  ProcessDate,
} from "@/types/payroll/payrollType";
import axios from "axios";
import { fetchAttendanceData } from "../../attendance-time/records/stage";
import { ContributionType } from "@/types/benefits/plans/plansTypes";
import { EmployeeSchedule } from "@/types/attendance-time/AttendanceTypes";

export async function stageTable(
  dateInfo: ProcessDate,
  stage_one: {
    payrolls: Payroll[];
    employees: MajorEmployee[];
    dataPH: PayslipPayhead[];
  },
  setStageMsg: (msg:string)=>void,
): Promise<PayslipData> {
  try {
    const { payrolls, employees, dataPH } = stage_one;
    const [stage_two, {attendanceLogs, employeeSchedule, statusesByDate}] = await Promise.all([
      axios.post('/api/admin/payroll/payslip/get-unprocessed', { dateID: dateInfo.id, stageNumber: 2 }),

      fetchAttendanceData(
        String(
            `/api/admin/attendance-time/records?start=${toGMT8(dateInfo.start_date).format(
                "YYYY-MM-DD"
            )}&end=${toGMT8(dateInfo.end_date).format("YYYY-MM-DD")}&all_employee=true`
        )
    )
    ])
    // console.log(dataPH);
    setStageMsg("Performing calculations...");
    // Reuse employee schedule map for references below
    const { cashToDisburse, cashToRepay, benefitsPlansData, payableData } = convertToNumber({...stage_two.data.result});
    const employeeScheduleMap = employeeSchedule.reduce((acc, schedule) => {
        const { employee_id } = schedule;

        // If the employee_id does not exist in the accumulator, initialize it with an empty array
        if (!acc[employee_id]) {
            acc[employee_id] = [];
        }

        // Add the schedule to the array of the respective employee_id
        acc[employee_id].push(schedule);

        return acc;
    }, {} as Record<number, EmployeeSchedule[]>);

    const cashDisburseMap = new Map(
      cashToDisburse.map((ctd) => [
        ctd.employee_id, // Key
        ctd.amount_requested,
      ]) // RequestedID: AmountRequested
    );
    const cashRepayMap = new Map(
      cashToRepay.map((ctr) => [
        ctr.trans_cash_advances?.employee_id!, // Key
        (ctr.amount ?? 0) -
          ctr.trans_cash_advance_repayments.reduce(
            (sum, repayment) => sum + (repayment?.amount_repaid ?? 0),
            0
          ),
      ]) // DisbursedID: AmountDisbursed
    );
    const cashAdvancementIDMap = new Map(
      cashToDisburse.map((ctd) => [
        ctd.employee_id, // Key
        ctd.id,
      ])
    );
    const cashRepaymentIDMap = new Map(
      cashToRepay.map((ctr) => [
        ctr.trans_cash_advances?.employee_id!, // Key
        ctr.id, // Cash disbursed ID
      ])
    );

    const benefitDeductionMap = new Map(
        benefitsPlansData.map((bp) => [
        bp.ref_benefit_plans?.id,
        bp.ref_benefit_plans?.deduction_id,
      ])
    );
    const employeeBenefitsMap = benefitsPlansData.reduce(
      (acc, { trans_employees, ref_benefit_plans }) => {
        const employeeId = trans_employees?.id!;
        if (!acc[employeeId]) {
          acc[employeeId] = [];
        }
        acc[employeeId].push(
          ref_benefit_plans as ContributionSetting
        );
        return acc;
      },
      {} as Record<number, ContributionSetting[]>
    );

    const payableMap = payableData.reduce((acc, data)=> {
      const employeeID = data.employee_id;
      if (!acc[employeeID]) {
        acc[employeeID] = [];
      }
      acc[employeeID].push(data);
      return acc;
    }, {} as Record<number, PayableData[]>);

    const payableDeductionMap = new Map(
      payableData.map((pb) => [
        pb.id, // Key
        pb.ref_payheads.id,
      ])
    );
    

    // Calculate amounts and generate breakdowns in chunks
    // Initializes `calculatedAmountList` to store payhead amounts for each employee.
    let calculatedAmountList: Record<number, VariableAmountProp[]> = {};

    const startDate = toGMT8(String(dateInfo?.start_date)).startOf('day');
    const endDate = toGMT8(String(dateInfo?.end_date)).startOf('day');
    const payrollDays = endDate.diff(startDate,"day");
    const daysInMonth = startDate.daysInMonth();
    const monthPercent = Math.round((payrollDays / daysInMonth)*2) / 2;

    const amountRecordsMap = new Map(dataPH.map(dph=> [dph.id, new Map(dph.dim_payhead_specific_amounts.map(psa => [psa.employee_id, psa.amount]))]));
    await Promise.all(
      employees.map(async (emp) => {
        // Define base variables for payroll calculations.
        const schedules = employeeScheduleMap[emp.id];
        const timeSchedule =  0;
    
        // const ratePerHour = parseFloat(String(emp.ref_job_classes?.pay_rate)) || 0.0;
        const basicSalary = Number(String(emp?.ref_salary_grades?.amount ?? 0));
        const ratePerHour = 30; // Static rate/hr
        const { deductedUndertime, deductedUnhired, paidLeaves, paidOvertimes } = getAttendanceTotal({
                                      logStatus: statusesByDate,
                                      employeeID: emp.id,
                                      startDate: dateInfo.start_date,
                                      endDate: dateInfo.end_date,
                                  });
        // console.log({ emp: emp.id, deductedUndertime, paidLeaves, paidOvertimes })
        const baseVariables: BaseValueProp = {
            rate_p_hr: ratePerHour,
            total_shft_hr: 80,
            basic_salary: basicSalary,
            payroll_days: payrollDays,
            [static_formula.cash_advance_disbursement]: cashDisburseMap.get(emp.id) ?? 0,
            [static_formula.cash_advance_repayment]: cashRepayMap.get(emp.id!) ?? 0,
            [static_formula.tardiness]: deductedUndertime,
            [static_formula.unhired]: deductedUnhired,
            [static_formula.overtimes]: paidOvertimes,
            [static_formula.leaves]: paidLeaves,
            [static_formula.basic_salary]: (basicSalary * monthPercent) - deductedUnhired,
        };
    
        // Filter applicable payheads for calculation based on employee and payhead data.
        const calculateContributions: VariableAmountProp[] = employeeBenefitsMap[emp.id]
          ? employeeBenefitsMap[emp.id].map((benefit) => {
              const getBasicSalary = {
                payhead_id: null,
                variable: "",
                formula: "basic_salary",
              };
              return {
                link_id: benefit.id,
                payhead_id: benefitDeductionMap.get(benefit.id)!,
                variable: benefit.name,
                amount: new Benefit(benefit).getContribution(
                  calculateAllPayheads(baseVariables, [getBasicSalary])[0].amount
                ),
              };
            })
          : [];

        const calculatePayables: VariableAmountProp[] =  payableMap[emp.id]?
        payableMap[emp.id].map(payable => {
          return {
            link_id: payable.id,
            payhead_id: payable.ref_payheads.id,
            variable: String(payable.ref_payheads.name),
            amount: payable.amount,
          };
        }): [];

        // Filter applicable payheads based on conditions and calculations
        const applicableFormulatedPayheads: VariableFormulaProp[] = dataPH
          .filter((ph) => {
            return (
                (String(ph.calculation) === ""
                    ? (!!amountRecordsMap.get(ph.id)?.get(emp.id) || ph.is_overwritable)
                    : true) &&
                isAffected(tryParse(emp), tryParse(ph)) &&
                (ph.calculation === static_formula.leaves ? paidLeaves > 0 : true) &&
                (ph.calculation === static_formula.overtimes ? paidOvertimes > 0 : true) &&
                (ph.calculation === static_formula.cash_advance_disbursement ? cashDisburseMap.has(emp.id) : true) &&
                (ph.calculation === static_formula.cash_advance_repayment ? cashRepayMap.has(emp.id) : true) &&
                ph.calculation != static_formula.benefit_contribution && // Benefits already calculated, ignore.
                ph.calculation != static_formula.payable // Payables already calculated, ignore.
            );
          })
          .map((ph) => ({
            link_id: (() => {
              if (ph.calculation === static_formula.cash_advance_disbursement) {
                if (cashAdvancementIDMap.has(emp.id)) {
                  return cashAdvancementIDMap.get(emp.id);
                }
              }
              if (ph.calculation === static_formula.cash_advance_repayment) {
                if (cashRepaymentIDMap.has(emp.id)) {
                  return cashRepaymentIDMap.get(emp.id);
                }
              }
              return undefined;
            })(),
            payhead_id: ph.id,
            variable: String(ph.variable),
            formula: (() => {
              const amountRecord = amountRecordsMap.get(ph.id)?.get(emp.id);
              return String(amountRecord ?? ph.calculation!=""? ph.calculation : "0");
            })(),
          }));
    
        // Calculate amounts and update `calculatedAmountList` with results for each employee.
        const calculatedAmount = calculateAllPayheads(
          baseVariables,
          applicableFormulatedPayheads
        ).filter((ca) => ca.payhead_id);
    
        calculatedAmountList[emp.id] = [
          ...calculatedAmount,
          ...calculateContributions,
          ...calculatePayables,
        ];
      })
    );
    

    // Insert calculated breakdowns into `trans_payhead_breakdowns` table.
    // console.log("Preparing breakdowns...");
    setStageMsg("Getting ready...");
    const stage_three = await axios.post(
      "/api/admin/payroll/payslip/get-unprocessed",
      { dateID: dateInfo.id, stageNumber: 3, calculatedAmountList }
    );
    // console.log("Loading...");
    const breakdowns: Breakdown[] = stage_three.data.result.breakdowns;
    const breakdownPayheadIds = new Set(breakdowns.map((bd) => bd.payhead_id!));
    const payheads = dataPH.filter((dph) => breakdownPayheadIds.has(dph.id));
    const earnings = payheads.filter((p) => p.type === "earning");
    const deductions = payheads.filter((p) => p.type === "deduction");

    return {
      payrolls,
      breakdowns,
      employees,
      earnings,
      deductions,
      calculatedAmountList,
    };
  } catch (error) {
    console.error("Error in stageTable:", error);
    throw error;
  }
}

//// INTERFACES
interface PayrollData {
  cashToDisburse: CashToDisburse[];
  cashToRepay: CashToRepay[];
  benefitsPlansData: BenefitsPlanData[];
  payableData: PayableData[];
}

interface CashToDisburse {
  id: number;
  employee_id: number;
  amount_requested: number;
}

interface PayableData {
  id: number;
  employee_id: number;
  amount: number;
  ref_payheads: {
    id: number;
    name: string | null;
  };
}

interface CashToRepay {
  id: number;
  amount: number;
  trans_cash_advances: {
    employee_id: number;
  };
  trans_cash_advance_repayments: any[];
}

interface BenefitsPlanData {
  trans_employees: {
    id: number;
  };
  ref_benefit_plans: {
    id: number;
    name: string;
    deduction_id: number;
    ref_benefits_contribution_table: ContributionAdvanceSetting[];
  };
}

interface ContributionAdvanceSetting {
  employee_rate: number;
  employer_rate: number;
  min_salary: number;
  max_salary: number;
  min_MSC: number;
  max_MSC: number;
  msc_step: number;
  ec_threshold: number;
  ec_low_rate: number;
  ec_high_rate: number;
  wisp_threshold: number;
  actual_contribution_amount: number
  contribution_type: ContributionType;
}[]

function convertToNumber(data: PayrollData): PayrollData {
  return {
    cashToDisburse: data.cashToDisburse.map((item) => ({
      ...item,
      amount_requested: Number(item.amount_requested),
    })),
    cashToRepay: data.cashToRepay.map((item: any) => ({
      ...item,
      amount: Number(item.amount),
      trans_cash_advances: { ...item.trans_cash_advances },
    })),
    benefitsPlansData: data.benefitsPlansData.map((plan) => ({
      trans_employees: { ...plan.trans_employees },
      ref_benefit_plans: {
        ...plan.ref_benefit_plans,
        ref_benefits_contribution_advance_settings:
          plan.ref_benefit_plans.ref_benefits_contribution_table.map(
            (setting) => ({
              ...setting,
              min_salary: Number(setting.min_salary),
              max_salary: Number(setting.max_salary),
              min_MSC: Number(setting.min_MSC),
              max_MSC: Number(setting.max_MSC),
              msc_step: Number(setting.msc_step),
              ec_threshold: Number(setting.ec_threshold),
              ec_low_rate: Number(setting.ec_low_rate),
              ec_high_rate: Number(setting.ec_high_rate),
              wisp_threshold: Number(setting.wisp_threshold),
              actual_contribution_amount: Number(setting.actual_contribution_amount),
            })
          ),
      },
    })),
    payableData: data.payableData.map((item) => ({
      ...item,
      amount: Number(item.amount),
    })),
  };
}
