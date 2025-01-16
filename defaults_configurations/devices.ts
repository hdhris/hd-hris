import prisma from "@/prisma/prisma";
import { headers } from "next/headers";
import { parse } from "next-useragent";
import { toGMT8 } from "@/lib/utils/toGMT8";

export async function devices(user_id: string) {
    try {
        // Fetch IP and user-agent details concurrently
        const [ipResponse, userAgent] = await Promise.all([
            fetch('https://ipapi.co/json', { cache: 'no-store' })
                .then(res => res.json())
                .catch(() => null), // If IP API fails, set response to null
            Promise.resolve(headers().get('user-agent') || '')
        ]);

        const ua = parse(userAgent);
        const ip_address = ipResponse?.ip || null; // Set to null if IP API failed
        const country_code = ipResponse?.country_code || null;
        const country_name = ipResponse?.country_name || null;
        const region = ipResponse?.region || null;
        const city = ipResponse?.city || null;

        const type = 'Browser';
        const platform = ua.browser;
        const os = ua.os;
        const os_version = String(ua.osVersion);

        // Fetch user and existing device data concurrently
        const [user, existingDevice] = await Promise.all([
            prisma.acl_user_access_control.findUnique({
                where: { user_id: user_id },
            }),
            prisma.sec_devices.findFirst({
                where: {
                    ip_address,
                    acl_user_access_control: { user_id },
                },
            }),
        ]);

        if (!user) {
            console.error(`User with ID ${user_id} does not exist.`);
            return; // Stop further execution if user doesn't exist
        }

        if (!existingDevice) {
            // Create a new device record
            await prisma.sec_devices.create({
                data: {
                    ip_address,
                    created_at: toGMT8().toISOString(),
                    updated_at: null,
                    country_code,
                    country_name,
                    region,
                    city,
                    platform_type: type,
                    platform,
                    os,
                    os_version,
                    login_count: 1,
                    acl_user_access_control_id: user.id,
                },
            });
        } else {
            // Update the existing device record
            await prisma.sec_devices.update({
                where: { id: existingDevice.id },
                data: {
                    is_logged_out: false,
                    ip_address,
                    created_at: toGMT8().toISOString(),
                    country_code,
                    country_name,
                    region,
                    city,
                    platform_type: type,
                    platform,
                    os,
                    os_version,
                    updated_at: toGMT8().toISOString(),
                    login_count: { increment: 1 },
                },
            });
        }
    } catch (error) {
        console.error("Error saving device information:", error);
    }
}