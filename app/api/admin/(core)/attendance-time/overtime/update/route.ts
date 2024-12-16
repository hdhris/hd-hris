import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

export async function POST(req: NextRequest) {
  const data = await req.json();
  try {
    // console.log(data);
    // return NextResponse.json({ status: 200 });
    const updated = await prisma.trans_overtimes.update({
      where: {
        id : data.id,
      },
      data : {
        ...data,
      },
    })
    console.log(updated)
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
