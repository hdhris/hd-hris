import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    const payheads = await prisma.ref_payheads.findMany({
        where: {
            deleted_at: null,
            is_active: true,
            variable: {
              not: null,
            },
        },
        orderBy: {
            created_at: "asc",
        },
    });
    const current = payheads.find((ph) => ph.id === id);
    const today = toGMT8().toISOString();
    const variables = payheads
      .filter((ph) => {
        if(ph.id === id){
          // console.log(ph.name, "Same ID")
          return false;
        }
        if(ph.variable?.length === 0 || ph.variable === null){
          // console.log(ph.name, "No variable")
          return false;
        }
        if(toGMT8(ph.created_at!).isBefore(toGMT8(current?.created_at ?? today))){
          // console.log(ph.created_at,"After",current?.created_at ?? toGMT8().toISOString());
          // console.log(ph.name, "After this")
          return false;
        }
        return true;
      })
      .map((ph) => ph.variable);
    return NextResponse.json(variables);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
