import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { number } from "zod";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
  const { data, affected, affectedJson, type } = await req.json();

  try {
    console.log(data);
    console.log(affected);
    console.log(affectedJson)

    // Create the payhead record

    await prisma.$transaction(async (pm)=>{
      const payhead = await pm.ref_payheads.create({
        data: {
          name: data.name,
          calculation: data.calculation,
          is_active: data.is_active,
          affected_json: affectedJson,
          type: type,
          created_at: toGMT8(new Date()),
          updated_at: toGMT8(new Date()),
        },
      });
  
      // Create new affected employees-leaves-status
      if (affected.length > 0) {
        await pm.dim_payhead_affecteds.createMany({
          data: affected.map((employeeId: number) => ({
            payhead_id: payhead.id,
            employee_id: employeeId,
            created_at: toGMT8(new Date()),
            updated_at: toGMT8(new Date()),
          })),
        });
      }
    })

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json(
      { error: "Failed to post data" },
      { status: 500 }
    );
  }
}
