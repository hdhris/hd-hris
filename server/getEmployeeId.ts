import {unstable_cache} from "next/cache";
import prisma from "@/prisma/prisma";
import {auth} from "@/auth";

export async function getEmployeeId() {
    const session = await auth()
    if (!session) {
        return null
    }
   return session.user.employee_id
}