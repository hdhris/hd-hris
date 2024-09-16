// authUtils.ts
import prisma from '@/prisma/prisma';
import {LoginValidation} from '@/helper/zodValidation/LoginValidation';
import SimpleAES from "@/lib/cryptography/3des";

interface UserPrivileges {
    web_access?: boolean;
    admin_panel?: boolean;
}


export const getUserData = async (username: string, password: string) => {
    const encrypt = new SimpleAES();

    // Query the user by username
    const credential = await prisma.credentials.findUnique({
        where: {username}, include: {users: true}
    });


    // Return error if user not found
    if (!credential) {
        return {error: {message: "User not found. Please check your credentials and try again."}};
    }


    // Compare password
    const passwordMatches = await encrypt.compare(password, credential.password);
    if (!passwordMatches) {
        return {error: {message: "Invalid username or password. Please try again."}};
    }

    // const user = await prisma.users.findUnique({
    //     where: {id: credential.id}
    // })
    //
    // if(!user){
    //     return {error: {message: "User not found. Please check your credentials and try again."}};
    // }
    //
    // // Check if user is banned
    // if (user.banned_till) {
    //     const isBanned = dayjs(user.banned_till).isAfter(dayjs())
    //     if (isBanned) {
    //         return {
    //             error: {
    //                 message: `You are banned for ${calculateRemainingDays(user.banned_till.toDateString())}`
    //             }
    //         }
    //     }
    // }

    // Process user role and return user data
    // const privileges = user.sys_privileges;
    // const accessibility = processJsonObject<UserPrivileges>(privileges?.accessibility);
    // const role = !accessibility?.web_access ? 'user' : 'admin';
    //
    // const emp_name = user.trans_employees
    // const name = getEmpFullName(emp_name)
    return {
        id: String(credential.id),
        name: credential.users.name || 'No Name', // Use actual user name if available
        picture: credential.users.image || '',
        email: credential.users.email || '', // privilege: privileges?.name || 'N/A',
        // employee_id: user.trans_employees?.id || null,
        isDefaultAccount: credential.username === 'admin'
    };
};

export const handleAuthorization = async (credentials: { username: string; password: string }) => {
    if (!credentials?.username || !credentials?.password) {
        throw new Error('Fields cannot be empty');
    }

    // Validate credentials
    const {username, password} = await LoginValidation.parseAsync(credentials);

    // Get user data
    const user = await getUserData(username, password);
    if (user?.error) {
        throw new Error(user.error.message);
    }

    return JSON.parse(JSON.stringify(user));
};