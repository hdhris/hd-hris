// authUtils.ts
import prisma from '@/prisma/prisma';
import {LoginValidation} from '@/helper/zodValidation/LoginValidation';

import {processJsonObject} from "@/lib/utils/parser/JsonObject";
import SimpleAES from "@/lib/cryptography/3des";
import dayjs from "dayjs";
import {calculateRemainingDays} from "@/lib/utils/dateFormatter";
import {UserPrivileges} from "@/types/JSON/user-privileges";
import {toGMT8} from "@/lib/utils/toGMT8";


export const getUserData = async (username: string, password: string) => {
    const encrypt = new SimpleAES();

    const auth = await prisma.auth_credentials.findUnique({
        where: {
            username
        }, include: {
            trans_users: true
        }
    })


    if (!auth) return {error: {message: "Invalid username or password"}}
// Compare password
    const passwordMatches = await encrypt.compare(password, auth.password!);
    if (!passwordMatches) {
        return {error: {message: "Invalid username or password. Please try again."}};
    }
    const access_control = await prisma.acl_user_access_control.findFirst({
        where: {
            user_id: auth.trans_users.id
        }, include: {
            sys_privileges: true
        }
    })

    if (!access_control) return {error: {message: "You are not authorized"}}
    if (access_control.banned_til) {
        const isBanned = dayjs(toGMT8(access_control?.banned_til)).isAfter(dayjs())
        if (isBanned) {
            return {
                error: {
                    message: `You are banned for ${calculateRemainingDays(toGMT8(access_control?.banned_til).toString())} days.`
                }
            }
        }
    }

// Process user role and return user data
    const privileges = access_control.sys_privileges;
    const accessibility = processJsonObject<UserPrivileges>(privileges?.accessibility);
    const role = !accessibility?.web_access

    if (role) throw new Error('Only admin can login');

    return {
        id: auth.user_id,
        name: auth.trans_users.name, // Use actual user name if available
        role,
        image: auth.trans_users.image || '',
        email: auth.trans_users.email || '',
        privilege: privileges?.name || 'N/A',
        isDefaultAccount: auth.username.toLowerCase() === 'admin'
    };
}


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
        console.log("Error: ", user.error.message);
        throw new Error(user.error.message);
    }


    // // Check user role
    // if (user.role !== 'admin') {
    //     throw new Error('Only admin can login');
    // }

    return JSON.parse(JSON.stringify(user));
};
