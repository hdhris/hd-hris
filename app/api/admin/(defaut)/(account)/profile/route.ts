import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {auth} from "@/auth";
import {UserProfile} from "@/types/routes/default/types";

export const dynamic = "force-dynamic"

export async function GET() {
    //get the user id from the token
    const token_id = await auth()
    // TODO: get user profile from database

    const [user_data, credential ] = await Promise.all([await prisma.acl_user_access_control.findUnique({
        where: {
            user_id: token_id?.user.id
        }, include: {
            sys_privileges: true, trans_users: true,
        }
    }), await prisma.auth_credentials.findUnique({
        where: {
            user_id: token_id?.user.id
        }
    }),
    ])


    const hasCredential = !!credential
    const users: UserProfile = {
        display_name: user_data?.trans_users?.name || "",
        image: user_data?.trans_users?.image || "",
        hasCredential,
        username: credential?.username || "",
        privilege: user_data?.sys_privileges?.name || ""
    }


    return NextResponse.json(users)

}


