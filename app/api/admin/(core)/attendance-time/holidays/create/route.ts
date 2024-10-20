import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { number } from "zod";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { objectExcludes } from "@/helper/objects/filterObject";

export async function POST(req: NextRequest) {
  const request = await req.json();
  console.log(request);
  const { holidayInfo, transHolidayInfo } = request;
  const isNewHoliday = holidayInfo.id === null;
  const isTransHoliday = transHolidayInfo != null;
  const isGoogle = typeof holidayInfo.id === "string";
  console.log("New Holiday: ", isNewHoliday);
  console.log("New TransHol: ", isTransHoliday);
  console.log("Google: ", isGoogle);
  try {
    // return NextResponse.json({ status: 200 });
    await prisma.$transaction(async (pm) => {
      let holiday;
      if (isNewHoliday) {
        holiday = await pm.ref_holidays.create({
          data: {
            ...objectExcludes(holidayInfo, ["id","unset"]),
            created_at: toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
          },
        });
      } else {
        if (!isGoogle) {
          holiday = await pm.ref_holidays.update({
            where: { id: holidayInfo.id },
            data: {
              ...objectExcludes(holidayInfo, ["id","unset"]),
              updated_at: toGMT8().toISOString(),
            },
          });
        }
      }

      if (holidayInfo.unset != null){
        await pm.trans_holidays.update({
          where: {
            date: {
              not : null,
            },
            id: Number(holidayInfo.unset),
          },
          data: {
            deleted_at: toGMT8().toISOString(),
          }
        })
      }

      let transHoliday;
      if (isTransHoliday) {
          // console.log("Not null");
          if (transHolidayInfo.id === null) {
          // console.log("Flag new");
          transHoliday = await pm.trans_holidays.create({
            data: {
              ...objectExcludes(transHolidayInfo, ["id"]),
              created_at: toGMT8().toISOString(),
              updated_at: toGMT8().toISOString(),
            },
          });
        } else {
          console.log("Flag updated");
          transHoliday = await pm.trans_holidays.update({
            where: {
              id: transHolidayInfo.id,
              date: {
                not: null,
              },
            },
            data: {
              ...objectExcludes(transHolidayInfo, ["id"]),
              updated_at: toGMT8().toISOString(),
            },
          });
        }
      }
      console.log(holiday,transHoliday);
    });
    
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json({ error: "Failed to post data" }, { status: 500 });
  }
}
