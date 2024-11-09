import { isAffected } from "@/components/admin/payroll/payslip/util";
import { tryParse } from "@/helper/objects/jsonParserType";
import {
  BaseValueProp,
  Benefit,
  calculateAllPayheads,
  ContributionSetting,
  VariableAmountProp,
  VariableFormulaProp,
} from "@/helper/payroll/calculations";
import { toGMT8 } from "@/lib/utils/toGMT8";
import {
  Breakdown,
  Payroll,
  PayslipData,
  PayslipEmployee,
  PayslipPayhead,
  ProcessDate,
} from "@/types/payroll/payrollType";
import axios from "axios";

export async function stageTable(
  dateInfo: ProcessDate,
  stage_one: {
    payrolls: Payroll[];
    employees: PayslipEmployee[];
    dataPH: PayslipPayhead[];
  },
  stage_two: {
    cashToDisburse: CashToDisburse[];
    cashToRepay: CashToRepay[];
    benefits_plans_data: BenefitsPlanData[];
  }
): Promise<PayslipData> {
  try {
    console.log(stage_one, stage_two);
    const { payrolls, employees, dataPH } = stage_one;
    const { cashToDisburse, cashToRepay, benefits_plans_data } =
      convertToNumber(stage_two);

    console.log("Preparing Cash Advances...");
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

    console.log("Preparing Contributions...");
    const benefitDeductionMap = new Map(
      benefits_plans_data.map((bp) => [
        bp.ref_benefit_plans?.id,
        bp.ref_benefit_plans?.deduction_id,
      ])
    );
    const employeeBenefitsMap = benefits_plans_data.reduce(
      (acc, { trans_employees, ref_benefit_plans }) => {
        const employeeId = trans_employees?.id!;
        if (!acc[employeeId]) {
          acc[employeeId] = [];
        }
        acc[employeeId].push(
          ref_benefit_plans as unknown as ContributionSetting
        );
        return acc;
      },
      {} as Record<number, ContributionSetting[]>
    );

    // Calculate amounts and generate breakdowns in chunks
    // Initializes `calculatedAmountList` to store payhead amounts for each employee.
    let calculatedAmountList: Record<number, VariableAmountProp[]> = {};

    const basicSalaryFormula = dataPH.find((ph) => ph.id === 51)?.calculation!;
    const payrollDays = toGMT8(dateInfo?.end_date!).diff(
      toGMT8(dateInfo?.start_date!),
      "day"
    );
    employees.forEach((emp) => {
      // Define base variables for payroll calculations.
      // const contribution = new Benefit(benefitMap.get(emp.id) as any).getContribution;
      const baseVariables: BaseValueProp = {
        rate_p_hr: parseFloat(String(emp.ref_job_classes?.pay_rate)) || 0.0,
        total_shft_hr: 80,
        payroll_days: payrollDays,
        get_disbursement: cashDisburseMap.get(emp.id) ?? 0,
        get_repayment: cashRepayMap.get(emp.id!) ?? 0,
      };

      // Filter applicable payheads for calculation based on employee and payhead data.
      console.log("Calculating Contributions...");
      const calculateContributions: VariableAmountProp[] = employeeBenefitsMap[
        emp.id
      ]
        ? employeeBenefitsMap[emp.id].map((benefit) => {
            const getBasicSalary = {
              payhead_id: null,
              variable: "",
              formula: String(basicSalaryFormula),
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
      //51 Basic Salary
      //53 Cash Disbursement
      //54 Cash Repayment
      console.log("Calculating Earnings and Deductions...");
      const applicableFormulatedPayheads: VariableFormulaProp[] = dataPH
        .filter((ph) => {
          return (
            String(ph.calculation) !== "" &&
            isAffected(tryParse(emp), tryParse(ph)) &&
            (ph.id === 53 ? cashDisburseMap.has(emp.id) : true) &&
            (ph.id === 54 ? cashRepayMap.has(emp.id) : true) &&
            ph.ref_benefit_plans.length === 0 // Benefits already calculated, ignore.
          );
        })
        .map((ph) => ({
          link_id: (() => {
            if (ph.id === 53) {
              if (cashAdvancementIDMap.has(emp.id)) {
                return cashAdvancementIDMap.get(emp.id);
              }
            }
            if (ph.id === 54) {
              if (cashRepaymentIDMap.has(emp.id)) {
                return cashRepaymentIDMap.get(emp.id);
              }
            }
            return undefined;
          })(),
          payhead_id: ph.id,
          variable: String(ph.variable),
          formula: String(ph.calculation),
        }));

      // Calculate amounts and update `calculatedAmountList` with results for each employee.
      const calculatedAmount = calculateAllPayheads(
        baseVariables,
        applicableFormulatedPayheads
      ).filter((ca) => ca.payhead_id);
      calculatedAmountList[emp.id] = [
        ...calculatedAmount,
        ...calculateContributions,
      ];
    });

    // return NextResponse.json(calculatedAmountList);
    // Insert calculated breakdowns into `trans_payhead_breakdowns` table.
    console.log("Preparing breakdowns...");
    const stage_three = await axios.post(
      "/api/admin/payroll/payslip/get-unprocessed",
      { dateID: dateInfo.id, stageNumber: 3, calculatedAmountList }
    );
    console.log("Loading...");
    const breakdowns: Breakdown[] = stage_three.data;
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
  benefits_plans_data: BenefitsPlanData[];
}

interface CashToDisburse {
  id: number;
  employee_id: number;
  amount_requested: number;
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
    employee_contribution: number;
    employer_contribution: number;
    ref_benefits_contribution_advance_settings: ContributionAdvanceSetting[];
  };
}

interface ContributionAdvanceSetting {
  min_salary: number;
  max_salary: number;
  min_MSC: number;
  max_MSC: number;
  msc_step: number;
  ec_threshold: number;
  ec_low_rate: number;
  ec_high_rate: number;
  wisp_threshold: number;
}

function convertToNumber(data: PayrollData): PayrollData {
  return {
    cashToDisburse: data.cashToDisburse.map((item: any) => ({
      ...item,
      amount_requested: Number(item.amount_requested),
    })),
    cashToRepay: data.cashToRepay.map((item: any) => ({
      ...item,
      amount: Number(item.amount),
      trans_cash_advances: { ...item.trans_cash_advances },
    })),
    benefits_plans_data: data.benefits_plans_data.map((plan: any) => ({
      trans_employees: { ...plan.trans_employees },
      ref_benefit_plans: {
        ...plan.ref_benefit_plans,
        employee_contribution: Number(
          plan.ref_benefit_plans.employee_contribution
        ),
        employer_contribution: Number(
          plan.ref_benefit_plans.employer_contribution
        ),
        ref_benefits_contribution_advance_settings:
          plan.ref_benefit_plans.ref_benefits_contribution_advance_settings.map(
            (setting: any) => ({
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
            })
          ),
      },
    })),
  };
}
