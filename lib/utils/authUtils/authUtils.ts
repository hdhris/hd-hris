// authUtils.ts
import prisma from '@/prisma/prisma';
import {LoginValidation} from '@/helper/zodValidation/LoginValidation';

import {processJsonObject} from "@/lib/utils/parser/JsonObject";
import SimpleAES from "@/lib/cryptography/3des";
import dayjs from "dayjs";
import {calculateRemainingDays} from "@/lib/utils/dateFormatter";
import {UserPrivileges} from "@/types/JSON/user-privileges";


export const getUserData = async (username: string, password: string) => {
    const encrypt = new SimpleAES();


    // Query the user by username
    const user = await prisma.account.findUnique({
        where: {
            username
        }, include: {
            user: {
                include: {
                    sys_privileges: true
                }
            }
        }
    });
    // Return error if user not found
    if (!user) {
        return {error: {message: "User not found. Please check your credentials and try again."}};
    }
    if (user.banned_till) {
        const isBanned = dayjs(user.banned_till).isAfter(dayjs())
        if (isBanned) {
            return {
                error: {
                    message: `You are banned for ${calculateRemainingDays(user.banned_till.toDateString())}`
                }
            }
        }
    }

    // Compare password
    const passwordMatches = await encrypt.compare(password, user.password!);
    if (!passwordMatches) {
        return {error: {message: "Invalid username or password. Please try again."}};
    }

    // Process user role and return user data
    const privileges = user.user.sys_privileges;
    const accessibility = processJsonObject<UserPrivileges>(privileges?.accessibility);
    const role = !accessibility?.web_access

    if (role) throw new Error('Only admin can login');

    return {
        id: user.userId,
        name: user.user.name || 'No Name', // Use actual user name if available
        role,
        image: user.user.image || '',
        email: user.user.email || '',
        privilege: privileges?.name || 'N/A',
        isDefaultAccount: user.username === 'admin'
    };
};

export const handleAuthorization = async (credentials: { username: string; password: string }) => {
    if (!credentials?.username || !credentials?.password) {
        throw new Error('Fields cannot be empty');
    }

    // Validate credentials
    const {username, password} = await LoginValidation.parseAsync(credentials);

    // Get IP and User-Agent
    // const ipResponse = await fetch('https://ipapi.co/json').then(data => data.json());
    // const ua = parse(headers().get('user-agent')!);

    // Get user data
    const user = await getUserData(username, password);
    if (user?.error) {
        throw new Error(user.error.message);
    }

    // // Check user role
    // if (user.role !== 'admin') {
    //     throw new Error('Only admin can login');
    // }

    return JSON.parse(JSON.stringify(user));
};
