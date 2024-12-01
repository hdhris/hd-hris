// /pages/api/batch-schedule.ts
import { toGMT8 } from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";
import { systemPayhead } from "@/types/payslip/types";
import { Decimal } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cashToDisburse, cashToRepay, benefitContribution } = body as {
      cashToDisburse: systemPayhead[];
      cashToRepay: systemPayhead[];
      benefitContribution: systemPayhead[];
    };

    const currentTimestamp = toGMT8().toISOString();
    const cashRepayAmountMap = new Map(cashToRepay.map(ctr=> [ctr.link_id, ctr.amount]));

    // Retrieve disbursed map and determine repayment status
    const getDisbursedMap = await prisma.trans_cash_advance_disbursements.findMany({
      where: { id: { in: cashToRepay.map((cr) => cr.link_id) } },
      select: {
        id: true,
        amount: true,
        trans_cash_advance_repayments: {
          select: { amount_repaid: true },
        },
      },
    }).then((db) =>
      new Map(
        db.map((item) => {
          const lastRepaid = item.trans_cash_advance_repayments.reduce(
            (sum, repayment) => sum.plus(repayment.amount_repaid || new Decimal(0)),
            new Decimal(0)
          );
          const totalRepaid = lastRepaid.toNumber() + cashRepayAmountMap.get(item.id)!;
          const status = totalRepaid >= (item.amount?.toNumber() || 0) ? "full_paid" : "to_be_paid";
          return [item.id, status];
        })
      )
    );

    await prisma.$transaction([
      // Add cash disbursements
      prisma.trans_cash_advance_disbursements.createMany({
        data: cashToDisburse.map((cd) => ({
          cash_advance_id: cd.link_id,
          amount: cd.amount,
          payroll_id: cd.payroll_id,
          payment_method: "payroll",
          repayment_status: "to_be_paid",
          disbursed_at: currentTimestamp,
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
        })),
      }),

      // Add cash repayments
      prisma.trans_cash_advance_repayments.createMany({
        data: cashToRepay.map((cr) => ({
          disbursement_id: cr.link_id,
          amount_repaid: cr.amount,
          payroll_id: cr.payroll_id,
          payment_method: "payroll",
          repaid_at: currentTimestamp,
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
        })),
      }),

      // Add benefit contributions
      prisma.trans_benefit_contributions.createMany({
        data: benefitContribution.map((bc) => ({
          employee_benefit_id: bc.link_id,
          employer_contribution: 0,
          employee_contribution: bc.amount,
          total_contribution: 0 + bc.amount,
          payroll_id: bc.payroll_id,
          contribution_date: currentTimestamp,
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
        })),
      }),

      // Update repayment status in bulk
      ...Array.from(getDisbursedMap.entries()).map(([id, status]) =>
        prisma.trans_cash_advance_disbursements.update({
          where: { id },
          data: { repayment_status: status },
        })
      ),
    ]);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, error: "Internal Server Error" });
  }
}
