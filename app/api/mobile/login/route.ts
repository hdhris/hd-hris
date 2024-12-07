import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import SimpleAES from "@/lib/cryptography/3des";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    // console.log(body);
    const credential = await prisma.auth_credentials.findFirst({
      where: { username: body.username },
      select: {
        password: true,
        trans_users: {
          select: {
            email: true,
          }
        }
      }
    });
    const aes = new SimpleAES();
    const match = await aes.compare(body.password, credential?.password || "");
    if(match){
      const user = await prisma.trans_employees.findFirst({
        where: {
          email: credential?.trans_users.email
        },
        ...emp_rev_include.employee_detail,
      });

      return NextResponse.json(user);
    }
    return NextResponse.json(false);
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    return NextResponse.json(
      { error: "Failed to post data: " + error },
      { status: 500 }
    );
  }
}
