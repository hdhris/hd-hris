import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { toGMT8 } from "@/lib/utils/toGMT8";
import {
  BaseValueProp,
  Benefit,
  calculateAllPayheads,
  ContributionSetting,
  VariableAmountProp,
  VariableFormulaProp,
} from "@/helper/payroll/calculations";
import { isAffected } from "@/components/admin/payroll/payslip/util";
import { tryParse } from "@/helper/objects/jsonParserType";
import { Parser } from "expr-eval";
import { PrismaClient } from "@prisma/client";
const parser = new Parser();

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateID = Number(searchParams.get("date"));
  const stageNumber = Number(searchParams.get("stage"));
  try {
    // Validate the provided `dateID`. If undefined, return a 404 response.
    if (!dateID) return NextResponse.json({ status: 404 });
    if (!stageNumber) return NextResponse.json({ status: 404 });

    if (stageNumber === 1){
      const result = await stage_one(prisma, dateID);
      return NextResponse.json(result, { status: 200 });
    } else if (stageNumber === 2){
      const result = await stage_two(prisma, dateID);
      return NextResponse.json(result, { status: 200 });
    }


  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error || "An error occurred" }, { status: 500 });
  }
}



async function stage_one(prisma: PrismaClient, dateID: number){
  try {

    const empData = await prisma.trans_employees.findMany({
      where: { deleted_at: null }, // Fetch only employees who haven't been deleted
      select: { id : true },
    });

    await Promise.all([
      prisma.trans_payrolls.createMany({
        data: empData.map((emp) => ({
          employee_id: emp.id,
          date_id: dateID,
          created_at: toGMT8().toISOString(),
          updated_at: toGMT8().toISOString(),
        })),
        skipDuplicates: true,
        // Uses `skipDuplicates` to prevent reinitialization if a record already exists
      }),

      // Clean up old or invalid payroll records.
      prisma.trans_payhead_breakdowns.deleteMany({
        where: {
          OR: [
            {
              trans_payrolls: {
                date_id: dateID,
                trans_employees: { deleted_at: { not: null } },
              },  // Deleted employees' breakdowns
            },
            {
              ref_payheads: { is_overwritable: false },
              trans_payrolls: { date_id: dateID },
            },
            {
              ref_payheads: { deleted_at: { not: null } },
              trans_payrolls: { date_id: dateID },
            },
          ],
        },
      }),

      // Remove payroll entries associated with deleted employees.
      prisma.trans_payrolls.deleteMany({
        where: { date_id: dateID, trans_employees: { deleted_at: { not: null } } },
      }),
    ]);

    return true;
  } catch(error){
    return NextResponse.json({ error: `Stage one: ${error || "An error occurred"}` },{ status: 500 });
  }
}

async function stage_two(prisma: PrismaClient, dateID: number){
  try {

    const [dateInfo, payrolls, dataPH, employees] = await Promise.all([
      prisma.trans_payroll_date.findFirst({ where: { id: dateID } }),
      prisma.trans_payrolls.findMany({ where: { date_id: dateID } }),
      prisma.ref_payheads.findMany({
        where: { deleted_at: null, is_active: true },
        include: { ref_benefit_plans: { select: { deduction_id: true } } },
        orderBy: { created_at: "asc" },
      }),
      prisma.trans_employees.findMany({
        where: { deleted_at: null }, // Fetch only employees who haven't been deleted
        select: {
          ...emp_rev_include.employee_detail.select, // Employee general information
          deleted_at: true,
          dim_payhead_affecteds: { select: { payhead_id: true } },
        },
      }),
    ])
    const payrollsMap = new Map(payrolls.map((pr) => [pr.employee_id, pr.id]));
    const employeeIds = Array.from(payrollsMap.keys());
    
    // Execute both queries concurrently
    const [cashToDisburse, cashToRepay, benefits_plans_data] = await Promise.all([
      prisma.trans_cash_advances.findMany({
        where: {
          employee_id: { in: employeeIds },
          status: "approved",
          trans_cash_advance_disbursements: {
            none: {}, // No disbursement should be present for these records
          },
        },
        select: {
          id: true,
          employee_id: true,
          amount_requested: true,
        },
      }),
      prisma.trans_cash_advance_disbursements.findMany({
        where: {
          repayment_status: "to_be_paid",
          trans_cash_advances: {
            employee_id: { in: employeeIds },
          },
        },
        select: {
          id: true,
          amount: true,
          trans_cash_advances: {
            select: {
              employee_id: true,
            },
          },
          trans_cash_advance_repayments : {
            select : {
              amount_repaid : true,
            }
          }
        },
      }),
      // Generate contributions
      prisma.dim_employee_benefits.findMany({
        where : {
          employee_id: { in: employeeIds },
          ref_benefit_plans : { is_active: true, deleted_at: null },
        },
        select: {
          trans_employees : {
            select : { id : true }
          },
          ref_benefit_plans : {
            select: {
              id: true,
              name: true,
              deduction_id: true,
              employee_contribution: true,
              employer_contribution: true,
              ref_benefits_contribution_advance_settings: {
                select: {
                  min_salary: true,
                  max_salary: true,
                  min_MSC: true,
                  max_MSC: true,
                  msc_step: true,
                  ec_threshold: true,
                  ec_low_rate: true,
                  ec_high_rate: true,
                  wisp_threshold: true,
                },
              },
            },
          }
        }
      }),
    ]);
    const cashDisburseMap = new Map(
      cashToDisburse.map((ctd) => [
        ctd.employee_id, // Key
        ctd.amount_requested,
      ]) // RequestedID: AmountRequested
    );
    // return NextResponse.json({cashToDisburse, cashToRepay});
    const cashRepayMap = new Map(
      cashToRepay.map((ctr) => [
        ctr.trans_cash_advances?.employee_id!, // Key
        (ctr.amount?.toNumber()??0) - ctr.trans_cash_advance_repayments.reduce((sum, repayment) => sum +(repayment?.amount_repaid?.toNumber()??0), 0),
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

    const benefitDeductionMap = new Map(benefits_plans_data.map(bp=> [bp.ref_benefit_plans?.id, bp.ref_benefit_plans?.deduction_id]));
    const employeeBenefitsMap = benefits_plans_data.reduce(
      (acc, { trans_employees, ref_benefit_plans }) => {
        const employeeId = trans_employees?.id!;
        if (!acc[employeeId]) {
          acc[employeeId] = [];
        }
        acc[employeeId].push(ref_benefit_plans as unknown as ContributionSetting);
        return acc;
      },
      {} as Record<number, ContributionSetting[]>
    );

    // Calculate amounts and generate breakdowns in chunks
    // Initializes `calculatedAmountList` to store payhead amounts for each employee.
    let calculatedAmountList: Record<number, VariableAmountProp[]> = {};

    const basicSalaryFormula = dataPH.find(ph=>ph.id===51)?.calculation!;
    employees.forEach((emp) => {
      // Define base variables for payroll calculations.
      // const contribution = new Benefit(benefitMap.get(emp.id) as any).getContribution;
      const baseVariables: BaseValueProp = {
        rate_p_hr: parseFloat(String(emp.ref_job_classes?.pay_rate)) || 0.0,
        total_shft_hr: 80,
        payroll_days: toGMT8(dateInfo?.end_date!).diff(toGMT8(dateInfo?.start_date!), 'day'),
        get_disbursement: cashDisburseMap.get(emp.id)?.toNumber()??0,
        get_repayment: cashRepayMap.get(emp.id!)??0,
      };

      // Filter applicable payheads for calculation based on employee and payhead data.
      const calculateContributions: VariableAmountProp[] = employeeBenefitsMap[emp.id]
      ? employeeBenefitsMap[emp.id].map((benefit) => {
          const getBasicSalary = {
            payhead_id: null,
            variable: '',
            formula: String(basicSalaryFormula),
          };
          return {
            link_id: benefit.id,
            payhead_id: benefitDeductionMap.get(benefit.id)!,
            variable: benefit.name,
            amount: new Benefit(benefit).getContribution(calculateAllPayheads(baseVariables, [getBasicSalary])[0].amount),
          };
        })
      : [];
      //51 Basic Salary
      //53 Cash Disbursement
      //54 Cash Repayment
      const applicableFormulatedPayheads: VariableFormulaProp[] = dataPH
        .filter((ph) => {
          return (
            String(ph.calculation) !== "" &&
            isAffected(tryParse(emp), tryParse(ph)) &&
            (ph.id === 53 ? cashDisburseMap.has(emp.id) : true) &&
            (ph.id === 54 ? cashRepayMap.has(emp.id) : true) &&
            (ph.ref_benefit_plans.length === 0) // Benefits already calculated, ignore.
          );
        }).map((ph) => ({
          link_id: (()=>{
            if(ph.id === 53){
              if(cashAdvancementIDMap.has(emp.id)){
                return cashAdvancementIDMap.get(emp.id);
              }
            }
            if(ph.id === 54){
              if(cashRepaymentIDMap.has(emp.id)){
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
      const calculatedAmount = calculateAllPayheads(baseVariables, applicableFormulatedPayheads).filter((ca) => ca.payhead_id);
      calculatedAmountList[emp.id] = [...calculatedAmount, ...calculateContributions];
    });

    // return NextResponse.json(calculatedAmountList);
    // Insert calculated breakdowns into `trans_payhead_breakdowns` table.
    await prisma.trans_payhead_breakdowns.createMany({
      data: Object.entries(calculatedAmountList).flatMap(([empId, payheads]) => {
        const payrollId = payrollsMap.get(Number(empId));
        return payheads.map((payhead) => ({
          payhead_id: payhead.payhead_id,
          payroll_id: payrollId,
          amount: payhead.amount!,
          created_at: toGMT8().toISOString(),
          updated_at: toGMT8().toISOString(),
        }));
      }),
      skipDuplicates: true,
    });

    // Fetch breakdowns and organize payheads into earnings and deductions
    const breakdowns = await prisma.trans_payhead_breakdowns.findMany({
      where: { payroll_id: { in: Array.from(payrollsMap.values()) } },
    });
    const breakdownPayheadIds = new Set(breakdowns.map((bd) => bd.payhead_id!));
    const payheads = dataPH.filter((dph) => breakdownPayheadIds.has(dph.id));
    const earnings = payheads.filter((p) => p.type === "earning");
    const deductions = payheads.filter((p) => p.type === "deduction");

    // Return the organized payroll data as a JSON response.
    return { payrolls, breakdowns, employees, earnings, deductions, calculatedAmountList };
  } catch(error){
    return NextResponse.json({ error: `Stage one: ${error || "An error occurred"}` },{ status: 500 })
  }
}
