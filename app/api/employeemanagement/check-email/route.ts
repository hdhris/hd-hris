// app/api/employeemanagement/check-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }

  const existingUser = await prisma.trans_users.findUnique({
    where: { email }
  });

  const existingEmployee = await prisma.trans_employees.findUnique({
    where: { email }
  });

  return NextResponse.json({ exists: !!(existingUser || existingEmployee) });
}