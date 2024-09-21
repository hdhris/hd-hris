import NextAuth, {Session, User} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {JWT} from "next-auth/jwt";
import {PrismaAdapter} from "@auth/prisma-adapter";
import prisma from "@/prisma/prisma";
import {handleAuthorization} from "@/lib/utils/authUtils/authUtils";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
import GoogleProvider from "next-auth/providers/google";


export const {handlers, signIn, signOut, auth, unstable_update} = NextAuth({
    adapter: PrismaAdapter(prisma), providers: [Credentials({
        credentials: {
            username: {}, password: {},
        }, authorize: async (credentials) => {
            // Type assertion to ensure correct type
            if (!credentials.username || !credentials.password) {
                throw new Error('Fields cannot be empty');
            }

            // Validate credentials
            const {username, password} = await LoginValidation.parseAsync(credentials as {
                username: string;
                password: string
            });

            // Get user data
            return await handleAuthorization({username, password});
        },
    }), GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET, authorization: {
            params: {
                prompt: "consent", access_type: "offline", response_type: "code",
            },
        },
    })], callbacks: {
        async signIn({account, user}) {
            try {
                if (account?.provider === "google") {
                    // Check if user email exists in the employees table
                    const employeeEmail = await prisma.trans_employees.findFirst({
                        where: {
                            email: user.email || undefined,
                        },
                    });

                    if (!employeeEmail) {
                        console.error("Unauthorized login attempt.");
                        return false; // User is not authorized
                    }

                    return true;

                }

                return true; // Handle other providers
            } catch (error) {
                console.error("Login error:", error);
                return false; // Stop the login process on error
            }
        }, authorized({request: {nextUrl}, auth}) {
            const isLoggedIn = !!auth?.user;
            const {pathname} = nextUrl;
            if (pathname.startsWith('/api/auth/signin') && isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }
            return !!auth
        }, async jwt({token, user}) {
            if (user) {
                return {
                    ...token,
                    image: user.image,
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    privilege: user.privilege,
                    isDefaultAccount: user.isDefaultAccount
                } as JWT;
            }
            return token;
        }, async session({session, token}: { session: Session, token: JWT, user: User }) {

            session.user = token;
            return session;
        },
    }, pages: {
        signIn: "/", error: "/"
    }, secret: process.env.AUTH_SECRET, session: {
        strategy: "jwt"
    }
})


