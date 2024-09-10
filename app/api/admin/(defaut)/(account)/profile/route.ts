import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {auth} from "@/auth";
import dayjs from "dayjs";
import {UserProfile} from "@/types/routes/default/types";

export async function GET() {
    //get the user id from the token
    const token_id = await auth()
    // TODO: get user profile from database
    const user_data = await prisma.sys_accounts.findFirst({
        where: {
            id: Number(token_id?.user.id)
        }, include: {
            trans_employees: {
                select: {
                    picture: true,
                    prefix: true,
                    first_name: true,
                    last_name: true,
                    suffix: true,
                    extension: true,
                    email: true,
                    birthdate: true,
                    gender: true,
                    contact_no: true,
                    addr_baranggay: true,
                    addr_municipal: true,
                    addr_province: true,
                    addr_region: true
                }
            },
        }
    })


    const users: UserProfile = {
        username: user_data?.username!,
        picture: user_data?.trans_employees?.picture!,
        prefix: user_data?.trans_employees?.prefix!,
        first_name: user_data?.trans_employees?.first_name!,
        last_name: user_data?.trans_employees?.last_name!,
        suffix: user_data?.trans_employees?.suffix!,
        extension: user_data?.trans_employees?.extension!,
        email: user_data?.trans_employees?.email!,
        birthdate: dayjs(user_data?.trans_employees?.birthdate!).format("YYYY-MM-DD"),
        gender: user_data?.trans_employees?.gender!,
        contact_no: user_data?.trans_employees?.contact_no!,
        barangay: String(user_data?.trans_employees?.addr_baranggay!),
        city: String(user_data?.trans_employees?.addr_municipal!),
        province: String(user_data?.trans_employees?.addr_province!,),
        region: String(user_data?.trans_employees?.addr_region!,)
    }
    return NextResponse.json(users)

}


