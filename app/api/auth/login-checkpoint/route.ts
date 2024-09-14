import {hasContentType} from "@/helper/content-type/content-type-check";
import {NextRequest, NextResponse} from "next/server";
import {ChangeCredentialSchema} from "@/helper/zodValidation/ChangeCredentialValidation";
import {getUserData} from "@/lib/utils/authUtils/authUtils";
import prisma from "@/prisma/prisma";
import {auth, signIn} from "@/auth";
import SimpleAES from "@/lib/cryptography/3des";
import {ZodError} from "zod";
import {login} from "@/actions/authActions";

export async function PUT(request: NextRequest) {
    try {
        hasContentType(request);

        const encrypt = new SimpleAES()

        const data = await request.json();
        const validateCredentials = ChangeCredentialSchema.parse(data);
        const session = await auth()
        const account_id = Number(session?.user?.id)

        const password_encrypt = await encrypt.encryptData(validateCredentials.new_password)
        const account = await prisma.sys_accounts.findFirst({
            where: {
                username: data.username,
            }
        })

        const password_check = await encrypt.compare(validateCredentials.new_password, account?.password!)

        if(password_check){ return NextResponse.json({message: "Please enter different credential"},{status: 400})}
        if(!account){
            await prisma.sys_accounts.update({
                where: {
                    id: account_id
                },
                data: {
                    username: validateCredentials.username,
                    password: password_encrypt
                }
            })

            return NextResponse.json({message: "Account updated successfully"},{status: 200})
        }

        return NextResponse.json({message: "Username already exist"}, {status: 400})

    } catch (error) {
        console.log(error)
        if(error instanceof ZodError){
            return NextResponse.json({message: error.message}, {status: 500})
        }
        return NextResponse.json({message: "Something went wrong"}, {status: 500})
    }
}