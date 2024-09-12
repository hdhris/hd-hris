import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parentCode = url.searchParams.get('parentCode');

    if (parentCode === null) {
      // Fetch top-level regions
      const regions = await prisma.ref_addresses.findMany({
        where: { parent_code: 0 },
        orderBy: { address_name: 'asc' },
      });
      return NextResponse.json(regions);
    }

    // Fetch addresses based on parentCode
    const addresses = await prisma.ref_addresses.findMany({
      where: { parent_code: parseInt(parentCode, 10) },
      orderBy: { address_name: 'asc' },
    });
    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.error();
  }
}
