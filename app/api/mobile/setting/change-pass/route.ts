import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import SimpleAES from "@/lib/cryptography/3des";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, old_password, new_password } = body;
  console.log(body);
  try {
    
    const credential = await prisma.auth_credentials.findFirst({
      where: {
        trans_users: {
          email: email,
        }
      },
      select: { password: true, id: true },
    });
    const aes = new SimpleAES();
    const match = await aes.compare(old_password, String(credential?.password));
    console.log(credential);
    if(match){
      await prisma.auth_credentials.update({
        where: {
          id: credential?.id,
        },
        data: {
          password: await aes.encryptData(String(new_password)),
        }
      })

      return NextResponse.json(true);
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
