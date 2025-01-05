import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { toGMT8 } from "@/lib/utils/toGMT8";
import {
  static_formula,
  VariableAmountProp,
} from "@/helper/payroll/calculations";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // const { searchParams } = new URL(req.url);
  const { dateID, stageNumber, calculatedAmountList } = await req.json();
  // const calculatedAmountList: Record<number, VariableAmountProp[]> = await req.json();
  try {
    // Validate the provided `dateID`. If undefined, return a 404 response.
    if (!dateID) return NextResponse.json({ status: 404 });
    if (!stageNumber) return NextResponse.json({ status: 404 });

    if (stageNumber === 1){
      const result = await stage_one(prisma, dateID);
      return NextResponse.json({result}, { status: 200 });
    } else if (stageNumber === 2){
      const result = await stage_two(prisma, dateID);
      return NextResponse.json({result}, { status: 200 });
    } else if (stageNumber === 3){
      if (!calculatedAmountList) return NextResponse.json({ status: 404 });
      const result = await stage_three(prisma, dateID, calculatedAmountList);
      return NextResponse.json({result}, { status: 200 });
    }


  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error || "An error occurred" }, { status: 500 });
  }
}



async function stage_one(prisma: PrismaClient, dateID: number){
  try {

    const [payrolls, dataPH, employees] = await Promise.all([
      prisma.trans_payrolls.findMany({
        where: {
          date_id: dateID,
          trans_employees: { deleted_at: null },
        }
      }),
      prisma.ref_payheads.findMany({
        where: { deleted_at: null, is_active: true },
        include: {
          ref_benefit_plans: { select: { deduction_id: true } },
          dim_payhead_specific_amounts: true,
        },
        orderBy: { created_at: "asc" },
      }),
      prisma.trans_employees.findMany({
        where: { deleted_at: null }, // Fetch only employees who haven't been deleted
        select: {
          ...emp_rev_include.employee_detail.select, // Employee general information
          deleted_at: true,
        },
      }),
    ])
    const employeeIDs = new Set(payrolls.map(pr=> pr.employee_id));

    await Promise.all([
      // Remove payroll entries associated with deleted employees.
      prisma.trans_payrolls.deleteMany({
        where: { date_id: dateID, trans_employees:{deleted_at:{ not:null }}},
      }),

      // Initialize payrolls with un-deleted employees.
      prisma.trans_payrolls.createMany({
        data: employees.map((emp) => ({
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
              ref_payheads: {
                OR: [
                  { is_active: false },
                  { is_overwritable: false },
                  { deleted_at: { not: null } },
                  { dim_payhead_affecteds: { none: {} } },
                  { ref_benefit_plans: { some: {
                      OR: [
                      { is_active: false },
                      {
                        effective_date: { gt: toGMT8().toISOString() },
                        expiration_date: { lt: toGMT8().toISOString() },
                      }
                    ]
                  }}},
                ]
              },
              trans_payrolls: { date_id: dateID },
            },
            {
              trans_payrolls: {
                date_id: dateID,
                trans_employees: {
                  trans_cash_advances_trans_cash_advances_employee_idTotrans_employees: {
                    none: {
                      status: "approved",
                      trans_cash_advance_disbursements: {
                        none: {}, // No disbursement should be present for these records
                      },
                    }
                  }
                },
              },
              ref_payheads: { calculation: static_formula.cash_advance_disbursement }
            },
            {
              trans_payrolls: {
                date_id: dateID,
                trans_cash_advance_disbursements: {
                  none: {
                    repayment_status: "to_be_paid",
                    trans_cash_advances: {
                      trans_employees_trans_cash_advances_employee_idTotrans_employees: {
                        deleted_at: null,
                      }
                    },
                  }
                },
              },
              ref_payheads: { calculation: static_formula.cash_advance_repayment }
            },
          ],
        },
      }),
    ]);

    return { payrolls, employees, dataPH };
  } catch(error){
    return NextResponse.json({ error: `Stage one: ${error || "An error occurred"}` },{ status: 500 });
  }
}

async function stage_two(prisma: PrismaClient, dateID: number){
  try {
    const payrolls = await prisma.trans_payrolls.findMany({where: { date_id: dateID }});
    const payrollsMap = new Map(payrolls.map((pr) => [pr.employee_id, pr.id]));
    const employeeIds = Array.from(payrollsMap.keys());
    
    // Execute both queries concurrently
    const [cashToDisburse, cashToRepay, benefitsPlansData] = await Promise.all([
      // Generate cash to disburse
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
      
      // Generate cash to repay
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
          ref_benefit_plans : {
            is_active: true,
            deleted_at: null,
            effective_date: { lte: toGMT8().toISOString() },
            expiration_date: { gte: toGMT8().toISOString() },
          },
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
              ref_benefits_contribution_table:{
                select: {
                  actual_contribution_amount: true,
                  contribution_type: true,
                  employee_rate: true,
                  employer_rate: true,
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

    return { cashToDisburse, cashToRepay, benefitsPlansData };
  } catch(error){
    return NextResponse.json({ error: `Stage one: ${error || "An error occurred"}` },{ status: 500 })
  }
}


async function stage_three(prisma: PrismaClient, dateID: number, calculatedAmountList: Record<number, VariableAmountProp[]>){
  try {
    const payheadIDs = Object.entries(calculatedAmountList).flatMap(([_, payheads]) => payheads.map(item => item.payhead_id)).filter(item => item!=null)
    const [payrolls, payheads] = await Promise.all([
      prisma.trans_payrolls.findMany({
        where: { date_id: dateID },
        select: {
          id: true,
          employee_id: true,
        }
      }),prisma.ref_payheads.findMany({
        where: {
          id: { in: payheadIDs }
        },
        select: {
          id: true, type: true
        }
      })
    ])

    const payheadsMap = new Map(payheads.map(item => [item.id, item.type]))
    const payrollsMap = new Map(payrolls.map((pr) => [pr.employee_id, pr.id]));
    const salaryAmount: Record<number, {earnings: number, deductions: number}> = {};
    await prisma.trans_payhead_breakdowns.createMany({
      data: Object.entries(calculatedAmountList).flatMap(([empId, payheads]) => {
        const payrollId = payrollsMap.get(Number(empId))!;
        salaryAmount[payrollId] = {
          earnings: 0,
          deductions: 0,
        }
        return payheads.map((payhead) => {
          const type = payheadsMap.get(payhead.payhead_id!)!
          if(type === "earning"){
            salaryAmount[payrollId].earnings +=  payhead.amount!
          } else {
            salaryAmount[payrollId].deductions +=  payhead.amount!
          }

          return {
            payhead_id: payhead.payhead_id,
            payroll_id: payrollId,
            amount: payhead.amount!,
            created_at: toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
          }
        });
      }),
      skipDuplicates: true,
    });
    // Fetch breakdowns and organize payheads into earnings and deductions
    const [breakdowns, updatedAmounts] = await Promise.all([
      prisma.trans_payhead_breakdowns.findMany({
        where: { payroll_id: { in: Array.from(payrolls.map(pr=>pr.id)) } },
      }),

      // Using Promise.all to ensure all update operations happen concurrently
      Promise.all(
        Object.entries(salaryAmount).map(([id, { earnings, deductions }]) =>
          prisma.trans_payrolls.update({
            where: { id: Number(id) },
            data: {
              gross_total_amount: earnings,
              deduction_total_amount: deductions,
            }
          })
        )
      )
    ])
    // Return the organized payroll data as a JSON response.
    return { breakdowns };
    // return true;
  } catch(error){
    return NextResponse.json({ error: `Stage one: ${error || "An error occurred"}` },{ status: 500 })
  }
}