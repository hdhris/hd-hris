import {NextRequest, NextResponse} from "next/server";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma"

export async function POST(req: NextRequest){
    try{
        hasContentType(req)
        const data = await req.json()

        // const request_total_days = await prisma.trans_leaves.findUnique({
        //     where: {
        //         id: data
        //     },
        //     select: {
        //         start_date: true,
        //         end_date: true,
        //         total_days: true
        //     }
        // })

        // throw new Error()


        console.log("Data: ", data)
        return NextResponse.json({
            success: true,
            message: "Cancel leave request successfully."
        })
    }catch (error){
        console.log("Error: ", error)
        return getPrismaErrorMessage(error)
    }
}