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
                code: data_validation.data.code,
                id: { not: data.id }, // Exclude the current record
            },
        });

        if (duplicate) {
            return NextResponse.json(
                { success: false, message: "Cannot have duplicate code. Try again." },
                { status: 409 }
            );
        }

        // Determine applicable employee types
        const is_applicable_for_all = data_validation.data.applicableToEmployeeTypes === "all";
        let employee_status_ids = [];

        if (is_applicable_for_all) {
            const ids = await prisma.ref_employment_status.findMany({
                where: { deleted_at: null },
                select: { id: true },
            });

            employee_status_ids = ids.map((id) => id.id);
        } else {
            employee_status_ids.push(Number(data_validation.data.applicableToEmployeeTypes));
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
                min_duration: data_validation.data.minDuration,
                max_duration: data_validation.data.maxDuration,
                attachment_required: data_validation.data.attachmentRequired,
                is_applicable_to_all: is_applicable_for_all,
                updated_at: new Date(),
                // Update related trans_leave_types
                trans_leave_types: {
                    deleteMany: {}, // Clear existing relationships
                    createMany: {
                        data: employee_status_ids.map((status_id) => ({
                            employment_status_id: status_id,
                            created_at: toGMT8().toISOString(),
                            updated_at: toGMT8().toISOString(),
                        })),
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: "Leave type updated successfully.",
        });
    } catch (err) {
        console.error("Error: ", err);

        return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
    }
}
