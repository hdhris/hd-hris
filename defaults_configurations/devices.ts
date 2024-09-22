import { headers } from "next/headers";
import { parse } from 'next-useragent';
import prisma from "@/prisma/prisma";

export async function devices(user_id: string) {
    try {
        // Fetch IP and user-agent details concurrently
        const [ipResponse, userAgent] = await Promise.all([
            fetch('https://ipapi.co/json').then(res => res.json()),
            Promise.resolve(headers().get('user-agent') || '')
        ]);

        // Parse the user agent details
        const ua = parse(userAgent);
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

        // Check if a record exists for this user and device
        const existingDevice = await prisma.sys_devices.findUnique({
            where: { user_id }
        });

        if (!existingDevice) {
            // If no record exists, create a new one
            await prisma.sys_devices.create({
                data: {
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
                    login_count: 1,
                },
            });
        } else if (existingDevice.ip_address !== ip_address) {
            // If the IP address has changed, create a new record
            await prisma.sys_devices.create({
                data: {
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
                    login_count: 1,
                },
            });
        } else {
            // If IP hasn't changed, increment login count
            await prisma.sys_devices.update({
                where: { user_id },
                data: {
                    updated_at: new Date(),
                    login_count: {
                        increment: 1,
                    },
                },
            });
        }

    } catch (error) {
        console.error("Error saving device information:", error);
    }
}
