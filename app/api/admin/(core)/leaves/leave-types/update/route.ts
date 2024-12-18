import { hasContentType } from "@/helper/content-type/content-type-check";
import { NextRequest, NextResponse } from "next/server";
import { Logger, LogLevel } from "@/lib/logger/Logger";
import prisma from "@/prisma/prisma";
import { LeaveTypeSchema } from "@/helper/zodValidation/leaves/leave-types-form/LeaveTypesForm";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function PATCH(request: NextRequest) {
    try {
        hasContentType(request);

        const data = await request.json();

        console.log("Patch leave types:", data)

        const logger = new Logger(LogLevel.DEBUG);
        // logger.debug(data);

        // Validate data using schema
        const data_validation = await LeaveTypeSchema.safeParseAsync(data);

        if (!data_validation.success) {
            return NextResponse.json(
                { success: false, message: "Validation failed.", errors: data_validation.error.errors },
                { status: 400 }
            );
        }

        // Check if the leave type exists
        const leaveType = await prisma.ref_leave_type_details.findUnique({
            where: { id: data.id },
        });

        if (!leaveType) {
            return NextResponse.json(
                { success: false, message: "Leave type not found." },
                { status: 404 }
            );
        }

        // Check for duplicate code
        const duplicate = await prisma.ref_leave_type_details.findFirst({
            where: {
                name: data_validation.data.name,
                code: data_validation.data.code,
                id: { not: data.id }, // Exclude the current record
            },
        });

        if (duplicate) {
            return NextResponse.json(
                { success: false, message: "Cannot have duplicate name or code. Try again." },
                { status: 409 }
            );
        }

        // Update the leave type details
        await prisma.ref_leave_type_details.update({
            where: { id: data.id },
            data: {
                name: data_validation.data.name,
                code: data_validation.data.code,
                description: data_validation.data.description,
                carry_over: data_validation.data.carryOver,
                paid_leave: data_validation.data.paidLeave,
                is_active: data_validation.data.isActive,
                max_duration: data_validation.data.maxDuration,
                attachment_required: data_validation.data.attachmentRequired,
                updated_at: new Date(),
            },
        });

        // const findLeaveType = await prisma.trans_leave_types.findMany({
        //     where: {
        //
        //     }
        // })
        // if(employee_status_ids.length > 1){
        //     await prisma.trans_leave_types.updateMany({
        //         where:{
        //
        //         }
        //     })
        // }


        return NextResponse.json({
            success: true,
            message: "Leave type updated successfully.",
        });
    } catch (err) {
        console.error("Error: ", err);

        return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
    }
}
