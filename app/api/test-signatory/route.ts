import {getSignatory} from "@/server/signatory";
import {NextRequest, NextResponse} from "next/server";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";

export const dynamic = "force-dynamic"
export async function GET(req: NextRequest) {
    try{
        const { searchParams } = new URL(req.url);
        const path = Number(searchParams.get("id"));
        const signatory = await getSignatory({
            path: "/leaves/leave-requests",
            applicant_id: path
        })
        return NextResponse.json(signatory)
    }catch (err){
        console.log("Error: ", err)
        return getPrismaErrorMessage(err)
    }
}