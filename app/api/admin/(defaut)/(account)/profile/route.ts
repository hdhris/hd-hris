import {NextRequest, NextResponse} from "next/server";
import {UserProfile} from "@/types/routes/default/types";
import {z} from "zod";

export function GET() {
    const user: UserProfile = {
        profilePicture: "https://avatars.githubusercontent.com/u/30373425?v=4",
        username: "johndoe",
        first_name: "John",
        last_name: "Doe",
        birthdate: "1990-01-15",
        civil_status: "separated",
        email: "johndoe@example.com",
        phone_no: "+1234567890",
        street_or_purok: "123 Main St",
        barangay: "Barangay San Isidro",
        city: "City of Makati",
        province: "Metro Manila"
    }

    return NextResponse.json(user)

}


