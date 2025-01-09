import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const status = searchParams.get("active");

        const records = await prisma.dim_training_participants.findMany({
            where: {
                ref_training_programs: {
                    deleted_at: null,
                },
            },
            include: {
                ref_training_programs: {
                    select: {
                        name: true,
                        description: true,
                        type: true,
                        location: true,
                        start_date: true,
                        end_date: true,
                        instructor_name: true,
                        hour_duration: true,
                        is_active: true,
                        trans_employees: {
                            select: {
                                first_name: true,
                                last_name: true,
                            }
                        }
                    }
                },
                trans_employees: {
                    select: {
                        picture: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                        ref_departments: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { 
                created_at: 'desc'
            }
        });

        // Format records with location details
        const formattedRecords = await Promise.all(
            records.map(async (record) => {
                let locationDetails = null;
                if (record.ref_training_programs?.location) {
                    const location = typeof record.ref_training_programs.location === "string"
                        ? JSON.parse(record.ref_training_programs.location)
                        : record.ref_training_programs.location;

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
                    ...record,
                    ref_training_programs: {
                        ...record.ref_training_programs,
                        locationDetails,
                    }
                };
            })
        );

        return NextResponse.json(formattedRecords);
    } catch (error) {
        console.error("Error in fetching records:", error);
        return NextResponse.json({ error: "Failed to fetch records: " + error }, { status: 500 });
    }
}