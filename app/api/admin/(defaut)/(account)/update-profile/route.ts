import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {updateProfileSchema} from "@/helper/zodValidation/UpdateProfile";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import {auth, unstable_update} from "@/auth";

export async function PUT(req: NextRequest) {
    try {
        hasContentType(req)

        const data = await req.json();
        // Step 1: Retrieve the user ID from the session
        const session = await auth();
        const userId = session?.user.id; // Corrected userId reference
        const provider = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: "credential",
                    providerAccountId: userId!
                }
            },
            select: {
                provider: true
            }
        })
        // const updateSchema = provider?.provider === "credential" ? updateProfileSchema.omit({username: true}) : updateProfileSchema;
        const parsedData = updateProfileSchema.omit({username: true}).parse(data);

        // Validate the parsed data
        if (!parsedData) {
            return NextResponse.json({message: 'Validation error'}, {status: 400});
        }



        if (!userId) {
            return NextResponse.json({message: 'Unauthorized'}, {status: 401});
        }

        // Step 2: Retrieve the account associated with the user
        const account = await prisma.user.findUnique({
            where: {
                id: userId
            },
        });

        if (account) {
            try {
                // Step 3: Update the user account in the database
                await prisma.$transaction(async (tx) => {
                    // Update the account information
                    if(provider?.provider === "credential") {
                        const usernameData = updateProfileSchema.omit({display_name: true}).parse(data)
                        await tx.account.update({
                            where: {
                                provider_providerAccountId: {
                                    provider: "credential",
                                    providerAccountId: userId,
                                },
                            },
                            data: {
                                username: usernameData.username,
                            },
                        });
                    }


                    // Update the user information
                    await tx.user.update({
                        where: {
                            id: userId,
                        },
                        data: {
                            name: parsedData.display_name,
                            image: data.picture,
                        },
                    });

                });

                // Step 4: Update the session with the new user data
                // await unstable_update({
                //     user: {
                //         name: parsedData.display_name,
                //         image: data.picture
                //     }
                // });

                return NextResponse.json({message: 'Account updated successfully'});
            } catch (error) {
                console.error("Update error:", error);
                return NextResponse.json({message: 'Internal server error'}, {status: 500});
            }
        } else {
            return NextResponse.json({message: 'Account not found'}, {status: 404});
        }

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({message: 'Validation error', errors: error.errors}, {status: 400});
        } else {
            console.error("Internal server error:", error);
            return NextResponse.json({message: 'Internal server error', error: error.message}, {status: 500});
        }
    }
}
