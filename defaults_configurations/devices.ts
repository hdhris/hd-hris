import {headers} from "next/headers";
import {parse} from 'next-useragent';
import {auth} from "@/auth";
import prisma from "@/prisma/prisma";

export async function devices() {
    try {
        const user = await auth();
        if (user) {
            const ipResponse = await fetch('https://ipapi.co/json').then(data => data.json());
            const ua = parse(headers().get('user-agent')!);

            // Get device information
            const user_id = user.id
            const ip_address = ipResponse.ip
            // const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24) // Expires in 24 hours
            const created_at = new Date()
            const updated_at = null
            const countrycode = ipResponse.country_code // Country code from geoip
            const countryname = ipResponse.country_name // Country name
            const region = ipResponse.region // Region code
            const city = ipResponse.city // City name
            const type = 'Browser' // Browser type
            const platform = ua.browser // Browser name
            const os = ua.os // OS name
            const os_version = ua.osVersion // OS version
            const login_count = 1 // Start the login count as 1

            // Save device information


            await prisma.sys_devices.upsert({
                where: {
                    user_id: user_id
                }, create: {
                    user_id,
                    ip_address,
                    created_at,
                    updated_at,
                    countrycode,
                    countryname,
                    region,
                    city,
                    platform_type: type,
                    platform,
                    os,
                    os_version,
                    login_count
                }, update: {
                    updated_at: new Date(), // Update timestamp
                    login_count: {
                        increment: 1
                    }, // Increment login count
                }
            })

            console.log("Saved device information")

        }
        // Get IP and User-Agent

    } catch (error) {
        console.error(error);
    }
}