import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // const { searchParams } = new URL(req.url);
    // const code = parseInt(searchParams.get('parent_code') as string);
    const addresses = await prisma.ref_addresses.findMany();
    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
