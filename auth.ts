import NextAuth, {Session, User} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {JWT} from "next-auth/jwt";
import {PrismaAdapter} from "@auth/prisma-adapter";
import prisma from "@/prisma/prisma";
import {handleAuthorization} from "@/lib/utils/authUtils/authUtils";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
import GoogleProvider from "next-auth/providers/google";


export const {handlers, signIn, signOut, auth, unstable_update} = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [Credentials({
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
    }),  GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        authorization: {
            params: {
                prompt: "consent", access_type: "offline", response_type: "code",
            },
        },
    })], callbacks: {
        async signIn({ account, user }) {
            try {
                if (account?.provider === 'google') {
                    // Check if user email exists in the employees table
                    const employee_email = await prisma.trans_employees.findFirst({
                        where: {
                            email: user.email || undefined, // Handle nullable email
                        },
                    });

                    if (!employee_email) {
                        console.error("Unauthorized login attempt.");
                        return false; // User is not authorized
                    }

                    // Check if the user exists in the 'users' table
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                    });

                    if (existingUser) {
                        // If user exists but hasn't linked Google, link the account
                        const accountExists = await prisma.account.findUnique({
                            where: {
                                provider_providerAccountId: {
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                },
                            },
                        });

                        if (!accountExists) {
                            // Link the new provider to the existing user
                            await prisma.account.create({
                                data: {
                                    userId: existingUser.id,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    type: account.type,
                                    access_token: account.access_token,
                                    refresh_token: account.refresh_token,
                                    expires_at: account.expires_at,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    updatedAt: new Date(),
                                },
                            });
                        }
                        return true;
                    }

                    return true; // User is authorized and logged in
                }

                return true; // Handle other providers
            } catch (error) {
                console.error("Login error:", error);
                return false; // Stop the login process
            }
        },
        authorized({request: {nextUrl}, auth}) {
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
        signIn: "/",
        error: "/"
    }, secret: process.env.AUTH_SECRET,
    session: {
        strategy: "jwt"
    }
})


