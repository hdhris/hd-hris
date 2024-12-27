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

        console.log("Data: ", data)
        const logger = new Logger(LogLevel.DEBUG);
        // logger.debug(data);

        // Validate data using schema
        const data_validation = await LeaveTypeSchema.omit({ applicableToEmployeeTypes: true }).safeParseAsync(data);

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

        // Fetch existing leave type records for the given leave type details ID
        // Fetch existing leave type records for the given leave type details ID
        const leaveTypeIds = await prisma.trans_leave_types.findMany({
            where: {
                leave_type_details_id: data.id,
            },
        });

        // Extract existing employment status IDs from the leave type records
        const existingEmploymentStatusIds = leaveTypeIds.map((record) => record.employment_status_id);

        // Handle removals: Find IDs in `existingEmploymentStatusIds` but not in `applicableToEmployeeTypes`
        const toBeRemoved = existingEmploymentStatusIds.filter(
            (id) => !data.applicableToEmployeeTypes.includes(id.toString())
        );

        for (const employeeTypeId of toBeRemoved) {
            console.log("Remove: ", employeeTypeId);
            await prisma.trans_leave_types.updateMany({
                where: {
                    leave_type_details_id: data.id,
                    employment_status_id: employeeTypeId,
                },
                data: {
                    deleted_at: toGMT8().toISOString(), // Set deleted_at to current time
                },
            });
        }

        // Loop through applicable employee types for additions or updates
        for (const employeeTypeId of data.applicableToEmployeeTypes) {
            if (existingEmploymentStatusIds.includes(parseInt(employeeTypeId))) {
                console.log("Update: ", employeeTypeId);
                // If already present, update `deleted_at` to null
                await prisma.trans_leave_types.updateMany({
                    where: {
                        leave_type_details_id: data.id,
                        employment_status_id: parseInt(employeeTypeId),
                    },
                    data: {
                        deleted_at: null,
                        updated_at: toGMT8().toISOString(), // Ensure updated_at reflects changes
                    },
                });
            } else {
                console.log("Create: ", employeeTypeId);
                // If not present, add new leave type record
                await prisma.trans_leave_types.create({
                    data: {
                        leave_type_details_id: data.id,
                        employment_status_id: parseInt(employeeTypeId),
                        created_at: toGMT8().toISOString(),
                        updated_at: toGMT8().toISOString(),
                        deleted_at: null,
                    },
                });
            }
        }

        // console.log("Leave Type: ", leave_type_ids)

        // for (const leaveTypeId of leave_type_ids) {
        //     await prisma.trans_leave_types.upsert({
        //         where: {
        //             id: leaveTypeId
        //         },
        //         update: {
        //             leave_type_details_id: data.id
        //         },
        //         create: {
        //             leave_type_details_id: data.id
        //         }
        //     })
        // }

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
                // trans_leave_types: {
                //     connectOrCreate: leave_type_ids.map((id) => ({
                //         where: {
                //             // Use the correct unique identifier or composite key alias
                //             id: id
                //         },
                //         // create: {
                //         //     leave_type_details_id: data.id!,
                //         //     employment_status_id: parseInt(employeeTypeId, 10), // Parse as integer
                //         // },
                //     })),
                // },
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
