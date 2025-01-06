import {NextRequest} from "next/server";
import {toGMT8} from "@/lib/utils/toGMT8";

export const getDashboardParams = (req: NextRequest) => {
    const {searchParams} = new URL(req.url);
    const year = parseInt(searchParams.get("year")!);
    const sem = searchParams.get("sem");

    if (!year || isNaN(year)) {
        // return NextResponse.json({error: "Invalid year parameter."}, {status: 400});
        throw new Error("Invalid year parameter.");
    }

    if (sem !== "1" && sem !== "2") {
        // return NextResponse.json({error: "Invalid semester parameter. Please provide '1' or '2'."}, {status: 400});
        throw new Error("Invalid semester parameter. Please provide '1' or '2'.");
    }

    const janToJunStart = new Date(year, 0, 1); // Jan 1st
    const janToJunEnd = new Date(year, 5, 30); // Jun 30th
    const julToDecStart = new Date(sem === "1" ? year - 1 : year, 6, 1); // Jul 1st
    const julToDecEnd = new Date(sem === "1" ? year - 1 : year, 11, 31); // Dec 31st

    // Convert to GMT+8
    const startFirstHalf = toGMT8(janToJunStart).toDate();
    const endFirstHalf = toGMT8(janToJunEnd).toDate();
    const startSecondHalf = toGMT8(julToDecStart).toDate();
    const endSecondHalf = toGMT8(julToDecEnd).toDate();
    return{
        sem,
        startFirstHalf,
        endFirstHalf,
        startSecondHalf,
        endSecondHalf
    }
}