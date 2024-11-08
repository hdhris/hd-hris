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
      },
      orderBy: {
        created_at: "asc",
      },
    });
    const current = payheads.find((ph) => ph.id === id);
    const variables = payheads
      .filter((ph) => {
        return (
          ph.id != id &&
          toGMT8(ph.created_at!).isBefore(toGMT8(current?.created_at!)) && // Dependent on older variables
          ph.variable != null &&
          ph.variable?.length
        );
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
