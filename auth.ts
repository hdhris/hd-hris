import NextAuth, {Session, User} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {JWT} from "next-auth/jwt";
import {PrismaAdapter} from "@auth/prisma-adapter";
import prisma from "@/prisma/prisma";
import {handleAuthorization} from "@/lib/utils/authUtils/authUtils";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";


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
            return await handleAuthorization({username, password});
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
                    ...token, picture: user.picture, id: user.id, name: user.name, role: user.role, email: user.email, privilege: user.privilege, employee_id: user.employee_id
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


