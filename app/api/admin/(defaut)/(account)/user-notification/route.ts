import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";

export async function POST(req: NextRequest){
    try {
        hasContentType(req)
        const data = await req.json()
        console.table(data)
        return NextResponse.json("hello")
    }catch (error){
        console.log(error)
        return getPrismaErrorMessage(error)
    }
}