import { NextResponse } from "next/server";
import addressJson from '@/components/common/forms/address/address.json';

export async function GET(req: Request) {
  try {
    // const { searchParams } = new URL(req.url);
    // const code = parseInt(searchParams.get('parent_code') as string);
    // const addresses = await prisma.ref_addresses.findMany();
    return NextResponse.json(addressJson);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
