import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(Number(searchParams.get("page")) || 1, 1); // Ensure positive page number
        const perPage = Math.max(Number(searchParams.get("limit")) || 5, 1); // Ensure positive limit
        const year = Number(searchParams.get("year")) || new Date().getFullYear();

        const signatories = await prisma.ref_evaluators.findMany({
            where: {
                deleted_at: null
            },
            distinct: ['signatories_path'],
            select: {
                signatories_path: true
            },
            orderBy: { updated_at: "desc" },
            take: perPage,
            skip: (page - 1) * perPage,

        });

        const [total_items, items] = await Promise.all([
            prisma.ref_evaluators.groupBy({
                by: ["signatories_path"],
                _count: {
                    id: true
                }
            }),

            prisma.ref_evaluators.findMany({
                where: {
                    signatories_path: {
                        in: signatories.map((signatory) => signatory.signatories_path)
                    }
                },
            })
        ]);
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({error: 'Failed to fetch data'}, {status: 500});
    }
}