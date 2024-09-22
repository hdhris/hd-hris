import {headers} from "next/headers";
import {parse} from 'next-useragent';
import prisma from "@/prisma/prisma";

export async function devices(user_id: string) {
    try {

        const ipResponse = await fetch('https://ipapi.co/json').then(data => data.json());
        const ua = parse(headers().get('user-agent')!);

        // Get device information
        // const user_id: string = user_id;
        const ip_address = ipResponse.ip;
        const created_at = new Date();
        const countrycode = ipResponse.country_code;
        const countryname = ipResponse.country_name;
        const region = ipResponse.region;
        const city = ipResponse.city;
        const type = 'Browser';
        const platform = ua.browser;
        const os = ua.os;
        const os_version = ua.osVersion;
        const login_count = 1;

        // Perform the upsert operation
        await prisma.sys_devices.upsert({
            where: {
                user_id: user_id, // Ensure user_id is defined
            }, create: {
                user_id,
                ip_address,
                created_at,
                updated_at: null,
                countrycode,
                countryname,
                region,
                city,
                platform_type: type,
                platform,
                os,
                os_version,
                login_count,
            }, update: {
                updated_at: new Date(), // Update timestamp
                login_count: {
                    increment: 1,
                }, // Increment login count
            },
        });

    } catch (error) {
        console.error("Error saving device information:", error);
    }
}
