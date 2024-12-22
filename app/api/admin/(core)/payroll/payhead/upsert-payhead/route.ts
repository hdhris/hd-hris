import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { Payhead } from "@/types/payroll/payheadType";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, amountRecords }: { data: Omit<Payhead, "dim_payhead_specific_amounts">; amountRecords: { employee_id: number; amount: number }[] } = body;

    // Ensure data and amountRecords are valid
    if (!data || !amountRecords) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const currentTimestamp = toGMT8().toISOString();

    let id;
    await prisma.$transaction(async (pm) => {
      // Upsert Payhead
      const payhead = await pm.ref_payheads.upsert({
        where: { id: data.id ?? -1 },
        create: {
          ...data,
          affected_json: {...data.affected_json},
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
        },
        update: {
          ...data,
          affected_json: {...data.affected_json},
          updated_at: currentTimestamp,
        },
      });
      
      // Change ID
      id = payhead.id;

      // Clear specific amounts no longer relevant
      await pm.dim_payhead_specific_amounts.deleteMany({
        where: {
          payhead_id: payhead.id,
          employee_id: {
            notIn: amountRecords.map((item) => item.employee_id),
          },
        },
      });

      // Upsert specific amounts
      await Promise.all(
        amountRecords.map((record) =>
          pm.dim_payhead_specific_amounts.upsert({
            where: {
              payhead_id_employee_id: {
                employee_id: record.employee_id,
                payhead_id: payhead.id,
              },
            },
            create: {
              employee_id: record.employee_id,
              payhead_id: payhead.id,
              amount: record.amount,
              created_at: currentTimestamp,
              updated_at: currentTimestamp,
            },
            update: {
              amount: record.amount,
              updated_at: currentTimestamp,
            },
          })
        )
      );
    });

    return NextResponse.json({ id },{ status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
