import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    const { removed, updated } = (await req.json()) as {
        removed: number[];
        updated: {
            id: number | undefined;
            timestamp: string;
            status: number;
            employee_id: number;
            punch: number;
            unique_id: string;
        }[];
    };

    console.log({ removed, updated });

    try {
        await prisma.$transaction(async (psm) => {
            // Delete removed logs
            await psm.log_attendances.deleteMany({
                where: {
                    id: { in: removed },
                },
            });

            // Update or create logs
            await Promise.all(
                updated.map((log) => {
                    if (log.id) {
                        // Update existing log
                        return psm.log_attendances.update({
                            where: {
                                id: log.id,
                            },
                            data: {
                                status: log.status,
                                punch: log.punch,
                            },
                        });
                    } else {
                        // Create new log
                        return psm.log_attendances.create({
                            data: {
                                ...log,
                                created_at: toGMT8().toISOString(), // Only include if necessary
                            },
                        });
                    }
                })
            );
        });

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error("Error:", error); // Log the error for debugging
        return NextResponse.json({ error: "Failed to post data: " + error }, { status: 500 });
    }
}