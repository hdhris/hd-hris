// /pages/api/batch-schedule.ts
import { systemPayhead } from "@/app/(admin)/(core)/payroll/payslip/page";
import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cashToDisburse, cashToRepay, benefitContribution } = body as { cashToDisburse: systemPayhead[], cashToRepay: systemPayhead[], benefitContribution: systemPayhead[] };

    const getDisbursedMap = await prisma.trans_cash_advance_disbursements.findMany({
      where: { id: { in: cashToRepay.map(cr=> cr.link_id) } },
      select: {
        id: true,
        amount: true,
        trans_cash_advance_repayments: {
          select: { amount_repaid: true }
        }
      }
    }).then(db=> db.map((item) => {
      // Calculate the total amount repaid
      const totalRepaid = item.trans_cash_advance_repayments.reduce((sum, repayment) => {
        return sum.plus(repayment.amount_repaid || new Decimal(0));
      }, new Decimal(0));
  
      // Determine the status based on the total repaid amount
      const status = totalRepaid.toNumber() >= (item.amount?.toNumber() || 0) ? "full_paid" : "to_be_paid";
  
      return [item.id, status] as const;
    }));

    await Promise.all([
      // Add cash disbursements
      prisma.trans_cash_advance_disbursements.createMany({
        data: cashToDisburse.map(cd=>{
          return {
            cash_advance_id: cd.link_id,
            amount: cd.amount,
            payroll_id: cd.payroll_id,
            payment_method: 'payroll',
            repayment_status: 'to_be_paid',
            disbursed_at: toGMT8().toISOString(),
            created_at: toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
          }
        })
      }),

      // Add cash repayments
      prisma.trans_cash_advance_repayments.createMany({
        data: cashToRepay.map(cr=>{
          return {
            disbursement_id: cr.link_id,
            amount_repaid: cr.amount,
            payroll_id: cr.payroll_id,
            payment_method: 'payroll',
            // repayment_status: 'to_be_paid',
            repaid_at: toGMT8().toISOString(),
            created_at: toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
          }
        })
      }),

      // Add benefit contributions
      prisma.trans_benefit_contributions.createMany({
        data: benefitContribution.map(bc=>{
          return {
            employee_benefit_id: bc.link_id,
            employer_contribution: 0,
            employee_contribution: bc.amount,
            total_contribution: 0 + bc.amount,
            payroll_id: bc.payroll_id,
            contribution_date: toGMT8().toISOString(),
            created_at: toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
          }
        })
      }),


      getDisbursedMap.map(async (db) =>{
        await prisma.trans_cash_advance_disbursements.update({
          where: {
            id: db[0],
          },
          data: {
            repayment_status: db[1],
          }
        })
      })
    ])
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
  }
}
