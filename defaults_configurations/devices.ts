export async function devices(user_id: string) {
    try {
        // Ensure user exists
        const user = await prisma.user.findUnique({
            where: { id: user_id },
        });

        if (!user) {
            console.error(`User with ID ${user_id} does not exist.`);
            return; // Stop further execution if user doesn't exist
        }

        // Fetch IP and user-agent details concurrently
        const [ipResponse, userAgent] = await Promise.all([
            fetch('https://ipapi.co/json').then(res => res.json()),
            Promise.resolve(headers().get('user-agent') || '')
        ]);

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
        const existingDevice = await prisma.sys_devices.findFirst({
            where: { user_id, ip_address }
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
        } else {
            // Update the login count and the updated_at timestamp
            await prisma.sys_devices.update({
                where: { id: existingDevice.id },
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
