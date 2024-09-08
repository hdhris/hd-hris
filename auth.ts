import NextAuth, {Session, User} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {JWT} from "next-auth/jwt";
import {PrismaAdapter} from "@auth/prisma-adapter";
import prisma from "@/prisma/prisma";
import Simple3Des from "@/lib/cryptography/3des";
import {processJsonObject} from "@/lib/utils/parser/JsonObject";
import {handleAuthorization} from "@/lib/utils/authUtils/authUtils";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";


interface UserPrivileges {
    web_access?: boolean
    admin_panel?: boolean
}


const getUserData = async (username: string, password: string): Promise<User | null> => {

    // Encrypt the password
    const encrypt = new Simple3Des().encryptData(password);

    // Query the database
    const data = await prisma.sys_accounts.findFirst({
        where: {
            AND: [{
                username: username, password: encrypt,
            }, {
                banned_till: {
                    gte: new Date()
                }
            }]

        }, include: {
            trans_employees: true, sys_privileges: true
        }
    });

    if (data) {
        const privileges = processJsonObject<UserPrivileges>(data.sys_privileges?.accessibility);
        const isWebAccess = privileges?.web_access

        const role = !privileges || isWebAccess ? "admin" : "user"


        return {
            id: String(data.id),
            name: "John Doe",
            role: role,
            picture: data.trans_employees?.picture!,
            email: data.trans_employees?.email!
        }
    }

    // Log the results
    // console.log("Query results in db:", db);


    return null;

}
export const {handlers, signIn, signOut, auth} = NextAuth({
    adapter: PrismaAdapter(prisma), providers: [Credentials({
        credentials: {
            username: {}, password: {},
        }, authorize: async (credentials) => {
            // Type assertion to ensure correct type
            if (!credentials.username || !credentials.password) {
                throw new Error('Fields cannot be empty');
            }

            // Validate credentials
            const { username, password } = await LoginValidation.parseAsync(credentials as { username: string; password: string });

            // Get user data
            const user = await handleAuthorization({ username, password });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            return user;
        },
    })], callbacks: {
        authorized({request: {nextUrl}, auth}) {
            const isLoggedIn = !!auth?.user;
            const {pathname} = nextUrl;
            if (pathname.startsWith('/api/auth/signin') && isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }
            return !!auth
        }, async jwt({token, user, session}) {
            if (user) {
                return {
                    ...token, picture: user.picture, id: user.id, name: user.name, role: user.role, email: user.email
                } as JWT;
            }
            return token;
        }, async session({session, token, user}: { session: Session, token: JWT, user: User }) {
            session.user = token;
            return session;
        },
    }, pages: {
        signIn: "/",
    }, secret: process.env.AUTH_SECRET, session: {
        strategy: "jwt"
    }
})


