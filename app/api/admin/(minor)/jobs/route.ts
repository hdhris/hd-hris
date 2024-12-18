import prisma from "@/prisma/prisma"
import { NextResponse } from "next/server"
export async function GET(){
    try {
       const jobs = await prisma.ref_job_classes.findMany({
           where: {
               deleted_at: null
           },
       })

        return NextResponse.json({success: true})
    } catch (error){
        console.log("Error: ", error)
        return NextResponse.json({success: false, message: "Failed to fetch data"})
    }
}