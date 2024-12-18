import prisma from "@/prisma/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export async function GET(){
    try {
       const jobs = await prisma.ref_job_classes.findMany({
           where: {
               deleted_at: null,
               is_active: true
           },
           select: {
               id: true,
               name: true
           },
           orderBy: {
               name: "asc"
           }
       })

        return NextResponse.json(jobs)
    } catch (error){
        console.log("Error: ", error)
        return NextResponse.json({success: false, message: "Failed to fetch data"})
    }
}