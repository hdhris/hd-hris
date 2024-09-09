// authUtils.ts
import axios from 'axios';
import { parse } from 'next-useragent';
import prisma from '@/prisma/prisma';
import { LoginValidation } from '@/helper/zodValidation/LoginValidation';
import Simple3Des from '@/lib/cryptography/3des';
import {processJsonObject} from "@/lib/utils/parser/JsonObject";
import {headers} from "next/headers";

interface UserPrivileges {
    web_access?: boolean;
    admin_panel?: boolean;
}

export const getUserData = async (username: string, password: string) => {
    // Encrypt the password
    const encrypt = new Simple3Des().encryptData(password);

    // Query the database
    const data = await prisma.sys_accounts.findFirst({
        where: {
            AND: [{
                username: username, password: encrypt,
            }, {
                // banned_till: {
                //     equals: null,
                //     gte: new Date()
                // }
            }]
        },
        include: {
            trans_employees: true,
            sys_privileges: true
        }
    });
    console.log(data)

    if (data) {
        const privileges = data.sys_privileges;
        const accessibility = processJsonObject<UserPrivileges>(privileges?.accessibility);
        const isWebAccess = accessibility?.web_access;

        const role = !accessibility || isWebAccess ? 'admin' : 'user';

        console.log("Your Role is: " + role);
        return {
            id: String(data.id),
            name: 'John Doe',
            role: role,
            picture: data.trans_employees?.picture!,
            email: data.trans_employees?.email!,
            privilege: privileges?.name
        };
    }

    return null;
};

export const handleAuthorization = async (credentials: { username: string; password: string }) => {
    if (!credentials?.username || !credentials?.password) {
        throw new Error('Fields cannot be empty');
    }

    // Validate credentials
    const { username, password } = await LoginValidation.parseAsync(credentials);

    // Get IP and User-Agent
    const ipResponse = await axios.get('https://ipapi.co/json');
    const ua = parse(headers().get('user-agent')!);

    // Get user data
    const user = await getUserData(username, password);
    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check user role
    if (user.role !== 'admin') {
        throw new Error('Only admin can login');
    }

    // Handle session
    const existingSession = await prisma.sys_sessions.findFirst({
        where: {
            account_id: Number(user.id),
            ip_address: ipResponse.data.ip,
        },
    });

    if (existingSession) {
        await prisma.sys_sessions.update({
            where: { id: existingSession.id },
            data: {
                updated_at: new Date(), // Update timestamp
                login_count: existingSession.login_count + 1, // Increment login count
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // Update expiration time
            },
        });
    } else {
        await prisma.sys_sessions.create({
            data: {
                account_id: Number(user.id),
                ip_address: ipResponse.data.ip,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 24 hours
                created_at: new Date(),
                updated_at: null,
                countrycode: ipResponse.data.country_code, // Country code from geoip
                countryname: ipResponse.data.country_name, // Country name
                region: ipResponse.data.region, // Region code
                city: ipResponse.data.city, // City name
                type: 'Browser', // Browser type
                platform: ua.browser, // Browser name
                os: ua.os, // OS name
                os_version: ua.osVersion, // OS version
                login_count: 1 // Start the login count as 1
            },
        });
    }

    return JSON.parse(JSON.stringify(user));
};
