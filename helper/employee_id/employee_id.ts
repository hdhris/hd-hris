import {auth} from "@/auth";
import prisma from "@/prisma/prisma";


export async function getEmployeeId() {
    const sessionId = await auth();
    const user = await prisma.sys_accounts.findFirst({where: {id: Number(sessionId?.user?.id)}})
    return user ? user.employee_id : null;
}