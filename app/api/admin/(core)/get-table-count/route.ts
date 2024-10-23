import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { Prisma } from "@prisma/client";


export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("tb");

    if (!table) {
      return NextResponse.json(
        { error: "Table name (tb) parameter is missing" },
        { status: 400 }
      );
    }

    const countOf = async (modelName: Uncapitalize<Prisma.ModelName>) => {
      try {
        const count: number = await (prisma[modelName] as any).count({
          where: {
            deleted_at: null,
          },
        });
        return count;
      } catch (error) {
        return null;
      }
    };

    const totalCount = await countOf(table as Uncapitalize<Prisma.ModelName>);

    if (totalCount !== null) {
      return NextResponse.json({ totalCount },{ status: 200 });
    } else {
      return NextResponse.json(
        { error: `Invalid or unsupported table name: ${table}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
