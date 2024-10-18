import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { number } from "zod";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { objectExcludes } from "@/helper/objects/filterObject";

export async function POST(req: NextRequest) {
  const request = await req.json();
  console.log(request)
  const { holidayInfo, transHoliday } = request
  const isNew = holidayInfo.id === null;
  const isGoogle = typeof holidayInfo.id === "string"
  console.log("New: ",isNew);
  console.log("Google: ",isGoogle);
  try {
    await prisma.$transaction(async (pm)=>{
      let holiday;
      if(isNew){
        holiday = await pm.ref_holidays.create({
          data: holidayInfo,
        })
      } else {
        if(!isGoogle){
          holiday = await pm.ref_holidays.update({
            where: { id: holidayInfo.id},
            data: objectExcludes(holidayInfo,["id"]),
          })
        }
      }
      
    })

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json(
      { error: "Failed to post data" },
      { status: 500 }
    );
  }
}
