import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma"
import {employee_basic_details} from "@/server/employee-details-map/employee-details-map";
import {LeaveApplicationEvaluations} from "@/types/leaves/leave-evaluators-types";
import {getSignatory} from "@/server/signatory";

export async function GET() {
    try {
        // const path = await req.json()
        const signatories = await getSignatory("/leaves/leave-requests", 10, true)
        return NextResponse.json({signatories})

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            success: false, message: "Error while fetching data."
        }, {status: 500})
    }
}