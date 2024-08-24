import {getRandomDateTime} from "@/lib/utils/dateFormatter";
import {Signatory} from "@/types/audit/types";
import {NextResponse} from "next/server";


export async function GET() {
    const signatories: Signatory[] = [{
        id: 1,
        name: "John Doe",
        picture: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/1.png",
        role: "Admin",
        status: "pending",
        dateTime: getRandomDateTime(new Date("4/13/2024"), new Date("5/13/2024"))
    }, {
        id: 2,
        name: "Jane Smith",
        picture: "https://d2u8k2ocievbld.cloudfront.net/memojis/female/1.png",
        role: "Finance",
        status: "declined",
        dateTime: getRandomDateTime(new Date("4/13/2024"), new Date("5/13/2024"))
    }, {
        id: 3,
        name: "Michael Johnson",
        picture: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
        role: "HR Manager",
        status: "approved",
        dateTime: getRandomDateTime(new Date("4/13/2024"), new Date("5/13/2024"))
    },]

    return NextResponse.json(signatories, {status: 200});

}