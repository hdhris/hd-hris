import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {updateProfileSchema} from "@/helper/zodValidation/UpdateProfile";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import {auth} from "@/auth";


export async function PUT(req: NextRequest) {
    try {
        hasContentType(req)

        const data = await req.json();
        const parsedData = updateProfileSchema.parse(data);

        // Validate the parsed data
        if (!parsedData) {
            return NextResponse.json({message: 'Validation error'}, {status: 400});
        }


        const {addr_province, addr_region, addr_municipal, addr_baranggay, username, birth_date, ...rest} = parsedData
        //TODO: implement a code that will track changes

// Step 1: Retrieve the employeeId from sys_accounts
        const sessionId = await auth();
        const userId = sessionId?.user.id;
// Retrieve the employee_id associated with the sys_account
        const account = await prisma.sys_users.findUnique({
            where: { id: userId },
            select: { employee_id: true, trans_employees: true }, // Include the trans_employees to check existence
        });

        await prisma.$transaction(async (prisma) => {
            if (account) {
                if (account.employee_id) {
                    // If employee_id exists, update the existing trans_employees record
                    await prisma.trans_employees.update({
                        where: { id: account.employee_id },
                        data: {
                            picture: data.picture,
                            first_name: rest.first_name,
                            last_name: rest.last_name,
                            gender: rest.gender,
                            contact_no: rest.contact_no,
                            email: rest.email,
                            birthdate: new Date(birth_date),
                            addr_province: parseInt(addr_province),
                            addr_region: parseInt(addr_region),
                            addr_municipal: parseInt(addr_municipal),
                            addr_baranggay: parseInt(addr_baranggay),
                            updated_at: new Date(),
                        },
                    });

                    // Update the username in sys_accounts
                    await prisma.credentials.update({
                        where: { id: userId },
                        data: {
                            username: username,
                        },
                    });
                } else {
                    // If employee_id does not exist, create a new trans_employees record and associate it
                    await prisma.sys_users.update({
                        where: { id: userId },
                        data: {
                            trans_employees: {
                                create: {
                                    picture: data.picture,
                                    first_name: rest.first_name,
                                    last_name: rest.last_name,
                                    gender: rest.gender,
                                    contact_no: rest.contact_no,
                                    email: rest.email,
                                    birthdate: new Date(birth_date),
                                    addr_province: parseInt(addr_province),
                                    addr_region: parseInt(addr_region),
                                    addr_municipal: parseInt(addr_municipal),
                                    addr_baranggay: parseInt(addr_baranggay),
                                    created_at: new Date(),
                                },
                            },
                        },
                    });
                }
            }
        });


        // Process the validated data (e.g., update profile in database)
        // Example: await updateProfile(parsedData);

        return NextResponse.json({message: 'Profile updated successfully'});

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({message: 'Validation error', errors: error.errors}, {status: 400});
        } else {
            console.error("Internal server error:", error);
            return NextResponse.json({message: 'Internal server error', error: error.message}, {status: 500});
        }
    }
}
