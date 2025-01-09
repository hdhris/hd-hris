import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch schedules
    const schedules = await prisma.dim_training_schedules.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        ref_training_programs: {
          select: {
            name: true,
            type: true,
            instructor_name: true,
          },
        },
      },
      orderBy: {
        session_timestamp: 'asc',
      },
    });

    // 2. Collect all unique address codes
    const addressCodes = new Set<number>();
    schedules.forEach(schedule => {
      if (schedule.location) {
        try {
          const location = JSON.parse(schedule.location);
          if (location.addr_region) addressCodes.add(Number(location.addr_region));
          if (location.addr_province) addressCodes.add(Number(location.addr_province));
          if (location.addr_municipal) addressCodes.add(Number(location.addr_municipal));
          if (location.addr_baranggay) addressCodes.add(Number(location.addr_baranggay));
        } catch (e) {
          console.error('Error parsing location:', e);
        }
      }
    });

    // 3. Fetch all addresses in one query
    const addresses = await prisma.ref_addresses.findMany({
      where: {
        address_code: {
          in: Array.from(addressCodes)
        }
      },
      select: {
        address_code: true,
        address_name: true,
      }
    });

    // 4. Create address lookup map
    const addressMap = new Map(
      addresses.map(addr => [addr.address_code, addr])
    );

    // 5. Format schedules with address details
    const formattedSchedules = schedules.map(schedule => {
      let locationDetails = null;
      if (schedule.location) {
        try {
          const location = JSON.parse(schedule.location);
          locationDetails = {
            addr_region: location.addr_region ? addressMap.get(Number(location.addr_region)) : null,
            addr_province: location.addr_province ? addressMap.get(Number(location.addr_province)) : null,
            addr_municipal: location.addr_municipal ? addressMap.get(Number(location.addr_municipal)) : null,
            addr_baranggay: location.addr_baranggay ? addressMap.get(Number(location.addr_baranggay)) : null,
          };
        } catch (e) {
          console.error('Error parsing location details:', e);
        }
      }

      return {
        ...schedule,
        locationDetails,
      };
    });

    return NextResponse.json(formattedSchedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}