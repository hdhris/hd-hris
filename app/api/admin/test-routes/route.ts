import prisma from "@/prisma/prisma";
import {NextResponse} from "next/server";

export async function GET() {


    const signatories = await prisma.trans_signatories.findMany({
        where: {
            deleted_at: null
        },
        include: {
            ref_signatory_paths: {
                select:{
                    id: true,
                    signatories_path: true,
                }
            },
            ref_signatory_roles: {
                select: {
                    id: true,
                    signatory_role_name: true
                }
            },
        }
    })


    return NextResponse.json(signatories)
}