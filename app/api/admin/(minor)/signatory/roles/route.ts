import prisma from "@/prisma/prisma"
import {NextResponse} from "next/server";
import {SignatoryRoles} from "@/types/signatory/signatory-types";

export const dynamic = "force-dynamic"
export async function GET() {
    try{
        const roles = await prisma.ref_signatory_roles.findMany({
            where: {
                deleted_at: null
            },
            select:{
                id: true,
                signatory_role_name: true
            },
            orderBy: {
                updated_at: "desc"
            }
        })
        return NextResponse.json(roles as SignatoryRoles[])
    } catch (error) {
        return NextResponse.json({message: "Failed to fetch signatory roles."}, {status: 500})
    }
}