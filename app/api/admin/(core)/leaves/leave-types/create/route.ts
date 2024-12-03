import {hasContentType} from "@/helper/content-type/content-type-check";
import {NextRequest, NextResponse} from "next/server";
import {Logger, LogLevel} from "@/lib/logger/Logger";
import prisma from "@/prisma/prisma"
import {LeaveTypeSchema} from "@/helper/zodValidation/leaves/leave-types-form/LeaveTypesForm";
import {toGMT8} from "@/lib/utils/toGMT8";

export async function POST(request: NextRequest) {
    try {
        hasContentType(request);

        const data = await request.json();

        const logger = new Logger(LogLevel.DEBUG)
        logger.debug(data)


        const data_validation = await LeaveTypeSchema.safeParseAsync(data)



        if(data_validation.success){
            const verify = await prisma.ref_leave_type_details.findUnique({
                where: {
                    code: data_validation.data.code
                }
            })
            if(verify) return NextResponse.json({success: false, message: "Cannot have duplicate code. Try Again"}, {status: 409})
            const is_applicable_for_all = data_validation.data.applicableToEmployeeTypes === "all"
            let employee_status_ids = []
            if(is_applicable_for_all){
                const ids =  await prisma.ref_employment_status.findMany({
                    where: {
                        deleted_at: null
                    },
                    select: {
                        id: true
                    }
                })

                employee_status_ids = [...ids.map(id => id.id)]
            } else {
                employee_status_ids.push(Number(data_validation.data.applicableToEmployeeTypes))
            }

            await prisma.ref_leave_type_details.create({
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
                    trans_leave_types: {
                        createMany: {
                            data: employee_status_ids.map(status_id => ({
                                employment_status_id: status_id,
                                created_at: toGMT8().toISOString(),
                                updated_at: toGMT8().toISOString(),
                            })),
                        }
                    }
                }
            })
         }

        return NextResponse.json({message: "Leave type created successfully.",
            // data: createdLeaveType
        });
    } catch (err) {
        console.error("Error: ", err); // Log the error for debugging

        // Handle validation errors
        // if (err instanceof ZodError) {
        //     return NextResponse.json({ message: "Validation error", errors: err.errors }, { status: 400 });
        // }

        return NextResponse.json({message: "Something went wrong"}, {status: 500});
    }
}
