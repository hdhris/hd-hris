import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Always fetch programs for the dropdown
    const programs = await prisma.ref_training_programs.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    if (id) {
      const schedule = await prisma.dim_training_schedules.findUnique({
        where: {
          id: parseInt(id),
          deleted_at: null,
        },
      });

      // Parse location and fetch address details
      let locationDetails = null;
      if (schedule?.location) {
        const location = typeof schedule.location === 'string' 
          ? JSON.parse(schedule.location) 
          : schedule.location;

        if (location) {
          locationDetails = {
            addr_region: location.addr_region ? await prisma.ref_addresses.findUnique({
              where: { address_code: Number(location.addr_region) },
              select: { address_code: true, address_name: true },
            }) : null,
            addr_province: location.addr_province ? await prisma.ref_addresses.findUnique({
              where: { address_code: Number(location.addr_province) },
              select: { address_code: true, address_name: true },
            }) : null,
            addr_municipal: location.addr_municipal ? await prisma.ref_addresses.findUnique({
              where: { address_code: Number(location.addr_municipal) },
              select: { address_code: true, address_name: true },
            }) : null,
            addr_baranggay: location.addr_baranggay ? await prisma.ref_addresses.findUnique({
              where: { address_code: Number(location.addr_baranggay) },
              select: { address_code: true, address_name: true },
            }) : null,
          };
        }
      }

      return NextResponse.json({ 
        schedule: { ...schedule, locationDetails }, 
        programs 
      });
    }

    return NextResponse.json({ programs });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" }, 
      { status: 500 }
    );
  }
}