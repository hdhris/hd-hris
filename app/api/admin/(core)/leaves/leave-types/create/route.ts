import {hasContentType} from "@/helper/content-type/content-type-check";
import {NextRequest, NextResponse} from "next/server";
import prisma from "@/prisma/prisma";

export async function POST(request: NextRequest) {
    try {
        hasContentType(request);

        const data = await request.json();

        // Validate the data
        // const validatedData = LeaveTypeSchema.parse(data);

        const isDuplicate = await prisma.ref_leave_types.findFirst({
            where: {
                name: data.name, // Check for the same name
                OR: [
                    {
                        applicable_to_employee_types: {
                            contains: "regular", // Check if it's already assigned to "regular"
                        },
                    },
                    {
                        applicable_to_employee_types: {
                            contains: "probationary", // Check if it's already assigned to "probationary"
                        },
                    },
                ],
            },
        });

        if (isDuplicate && data.applicableToEmployeeTypes.includes("all")) {
            return NextResponse.json({
                message: "Leave type with the same name already exists and cannot be set to 'all' if it's already assigned to 'regular' or 'probationary'."
            }, { status: 400 });
        }

        if (isDuplicate) {
            return NextResponse.json({message: "Leave type with the same name or employee type restriction already exists."}, {status: 400});
        }


        // Create a new leave type
        const createdLeaveType = await prisma.ref_leave_types.create({
            data: {
                name: data.name,
                code: data.code,
                description: data.description,
                carry_over: data.carryOver,
                paid_leave: data.paidLeave,
                is_active: data.isActive,
                min_duration: data.minDuration,
                max_duration: data.maxDuration,
                notice_required: data.noticeRequired,
                attachment_required: data.attachmentRequired,
                created_at: new Date(),
                updated_at: new Date(),
                applicable_to_employee_types: data.applicableToEmployeeTypes,
            },
        });

        return NextResponse.json({message: "Leave type created successfully.", data: createdLeaveType});
    } catch (err) {
        console.error("Error: ", err); // Log the error for debugging

        // Handle validation errors
        // if (err instanceof ZodError) {
        //     return NextResponse.json({ message: "Validation error", errors: err.errors }, { status: 400 });
        // }

        return NextResponse.json({message: "Something went wrong"}, {status: 500});
    }
}
