import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {auth} from "@/auth";
import dayjs from "dayjs";
import {UserProfile} from "@/types/routes/default/types";
import {undefined} from "zod";

export async function GET() {
    //get the user id from the token
    const token_id = await auth()
    // TODO: get user profile from database
    const user_data = await prisma.user.findUnique({
       where: {
           id: token_id?.user.id
       }, include: {
           sys_privileges: true
       }
    })

    const provider = await prisma.account.findFirst({
        select: {
            provider: true,
            username: true,
        },
        where: {
            userId: token_id?.user.id
        }
    })


    const users: UserProfile = {
        display_name: user_data?.name || "",
        image: user_data?.image || "",
        provider: provider?.provider || "",
        username: provider?.username || "",
        privilege: user_data?.sys_privileges?.name || ""
    }
    return NextResponse.json(users)

}


