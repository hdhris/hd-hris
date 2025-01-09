import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const programs = await prisma.ref_training_programs.findMany({
      where: {
        deleted_at: null,
        type: 'training',
      },
      include: {
        dim_training_participants: true,
        trans_employees: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const formattedPrograms = await Promise.all(
      programs.map(async (program) => {
        let locationDetails = null;
        if (program.location) {
          const location =
            typeof program.location === "string"
              ? JSON.parse(program.location)
              : program.location;

          if (location) {
            locationDetails = {
              addr_region: location.addr_region
                ? await prisma.ref_addresses.findUnique({
                    where: { address_code: Number(location.addr_region) },
                    select: { address_code: true, address_name: true },
                  })
                : null,
              addr_province: location.addr_province
                ? await prisma.ref_addresses.findUnique({
                    where: { address_code: Number(location.addr_province) },
                    select: { address_code: true, address_name: true },
                  })
                : null,
              addr_municipal: location.addr_municipal
                ? await prisma.ref_addresses.findUnique({
                    where: { address_code: Number(location.addr_municipal) },
                    select: { address_code: true, address_name: true },
                  })
                : null,
              addr_baranggay: location.addr_baranggay
                ? await prisma.ref_addresses.findUnique({
                    where: { address_code: Number(location.addr_baranggay) },
                    select: { address_code: true, address_name: true },
                  })
                : null,
            };
          }
        }

        return {
          ...program,
          locationDetails,
        };
      })
    );

    return NextResponse.json(formattedPrograms);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch programs: " + error }, { status: 500 });
  }
}
