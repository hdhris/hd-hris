import {hasContentType} from "@/helper/content-type/content-type-check";
import {NextRequest, NextResponse} from "next/server";
import prisma from "@/prisma/prisma"
import {LeaveTypeSchema} from "@/helper/zodValidation/leaves/leave-types-form/LeaveTypesForm";
import {toGMT8} from "@/lib/utils/toGMT8";

export async function POST(request: NextRequest) {
    try {
        hasContentType(request);

        const data = await request.json();


        console.log("Data Received: ", data)
        const data_validation = await LeaveTypeSchema.omit({applicableToEmployeeTypes: true}).safeParseAsync(data)



        if(data_validation.success){
            const verify = await prisma.ref_leave_type_details.findUnique({
                where: {
                    code: data_validation.data.code,
                    name: data_validation.data.name,
                }
            })
            if(verify) return NextResponse.json({success: false, message: "Cannot have duplicate name or code. Try Again"}, {status: 409})

            const create = await prisma.ref_leave_type_details.create({
                data: {
                    name: data_validation.data.name,
                    code: data_validation.data.code,
                    description: data_validation.data.description,
                    carry_over: data_validation.data.carryOver,
                    paid_leave: data_validation.data.paidLeave,
                    is_active: data_validation.data.isActive,
                    max_duration: data_validation.data.maxDuration,
                    attachment_required: data_validation.data.attachmentRequired,
                    trans_leave_types: {
                        createMany: {
                            data: data.applicableToEmployeeTypes.map((status_id: string) => ({
                                employment_status_id: Number(status_id),
                                created_at: toGMT8().toISOString(),
                                updated_at: toGMT8().toISOString(),
                            })),
                        }
                    }
                }
            })
            console.log("Created: ", create)

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
