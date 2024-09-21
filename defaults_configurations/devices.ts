import {headers} from "next/headers";
import {parse} from 'next-useragent';
import {auth} from "@/auth";

export async function devices() {
    try {

        const user = await auth();

        if (user) {
            const ipResponse = await fetch('https://ipapi.co/json').then(data => data.json());
            const ua = parse(headers().get('user-agent')!);

            // Get device information
            // const user_id = user.id;
            // const ip_address = ipResponse.ip;
            // const countrycode = ipResponse.country_code;
            // const countryname = ipResponse.country_name;
            // const region = ipResponse.region;
            // const city = ipResponse.city;
            // const platform = ua.os;
            // const os = ua.os.version;
            // const os_version = ua.os.version;
            // const platform_type = ua.os.family;
            // const login_count = 0;
            // const created_at = new Date();



            // Save device information

        }
        // Get IP and User-Agent

    } catch (error) {
        console.error(error);
    }
}