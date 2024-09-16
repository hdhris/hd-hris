// authUtils.ts
import axios from 'axios';
import { parse } from 'next-useragent';
import prisma from '@/prisma/prisma';
import { LoginValidation } from '@/helper/zodValidation/LoginValidation';

import {processJsonObject} from "@/lib/utils/parser/JsonObject";
import {headers} from "next/headers";
import SimpleAES from "@/lib/cryptography/3des";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import dayjs from "dayjs";
import {calculateRemainingDays} from "@/lib/utils/dateFormatter";

interface UserPrivileges {
    web_access?: boolean;
    admin_panel?: boolean;
}


export const getUserData = async (username: string, password: string) => {
    const encrypt = new SimpleAES();

    // Query the user by username
    const user = await prisma.sys_accounts.findFirst({
        where: { username },
        include: {
            trans_employees: true,
            sys_privileges: true
        }
    });

    // Return error if user not found
    if (!user) {
        return { error: { message: "User not found. Please check your credentials and try again." } };
    }
    if(user.banned_till){
        const isBanned = dayjs(user.banned_till).isAfter(dayjs())
        if(isBanned){
            return {
                error:{
                    message: `You are banned for ${calculateRemainingDays(user.banned_till.toDateString())}`
                }
            }
        }
    }

    // Compare password
    const passwordMatches = await encrypt.compare(password, user.password!);
    if (!passwordMatches) {
        return { error: { message: "Invalid username or password. Please try again." } };
    }

    // Process user role and return user data
    const privileges = user.sys_privileges;
    const accessibility = processJsonObject<UserPrivileges>(privileges?.accessibility);
    const role = !accessibility?.web_access ? 'user' : 'admin';

    const emp_name = user.trans_employees
    const name = getEmpFullName(emp_name)
    return {
        id: String(user.id),
        name: name|| 'No Name', // Use actual user name if available
        role,
        picture: user.trans_employees?.picture || '',
        email: user.trans_employees?.email || '',
        privilege: privileges?.name || 'N/A',
        employee_id: user.trans_employees?.id || null,
        isDefaultAccount: user.username === 'admin'
    };
};

export const handleAuthorization = async (credentials: { username: string; password: string }) => {
    if (!credentials?.username || !credentials?.password) {
        throw new Error('Fields cannot be empty');
    }

    // Validate credentials
    const { username, password } = await LoginValidation.parseAsync(credentials);

    // Get IP and User-Agent
    const ipResponse = await fetch('https://ipapi.co/json').then(data => data.json());
    const ua = parse(headers().get('user-agent')!);

    // Get user data
    const user = await getUserData(username, password);
    if (user?.error) {
        throw new Error(user.error.message);
    }

    // Check user role
    if (user.role !== 'admin') {
        throw new Error('Only admin can login');
    }

    // Handle session
    const existingSession = await prisma.sys_sessions.findFirst({
        where: {
            account_id: Number(user.id),
            ip_address: ipResponse.ip,
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
                ip_address: ipResponse.ip,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 24 hours
                created_at: new Date(),
                updated_at: null,
                countrycode: ipResponse.country_code, // Country code from geoip
                countryname: ipResponse.country_name, // Country name
                region: ipResponse.region, // Region code
                city: ipResponse.city, // City name
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
