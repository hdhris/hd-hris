import NextAuth, {Session, User} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {JWT} from "next-auth/jwt";
import prisma from "@/prisma/prisma";
import {handleAuthorization} from "@/lib/utils/authUtils/authUtils";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
import GoogleProvider from "next-auth/providers/google";

export const {handlers, signIn, signOut, auth} = NextAuth({
    // adapter: PrismaAdapter(prisma),
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
    }),
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: {

                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),

    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("Profile: ", profile);
            console.log("Account: ", account);
            console.log("User: ", user);
            try {

                if (account?.provider === 'google') {
                    const employee_email = await prisma.trans_employees.findFirst({
                        where: {
                            email: user.email || undefined, // Handle nullable email
                        },
                    });

                    if (!employee_email) {
                        console.error("Unauthorized login attempt.");
                        return false; // User is not authorized
                    }

                    return true; // User is authorized
                }

                return true; // For other providers
            } catch (error) {
                console.error("Login error:", error);
                return false; // Return false to stop the login process
            }
        },
        async redirect({ url, baseUrl }) {
            // Check if the URL is an error redirect
            if (url.includes('error')) {
                // Redirect to home page with error query
                return `${baseUrl}?error=unauthorized`;
            }

            // Default redirection
            return url.startsWith(baseUrl) ? url : baseUrl;
        },
        authorized({request: {nextUrl}, auth}) {
            const isLoggedIn = !!auth?.user;
            const {pathname} = nextUrl;
            if (pathname.startsWith('/api/auth/signin') && isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }
            return !!auth
        },
        async jwt({token, user, session}) {
            if (user) {
                return {
                    ...token, picture: user.picture, id: user.id, name: user.name, role: user.role, email: user.email, privilege: user.privilege, employee_id: user.employee_id, isDefaultAccount: user.isDefaultAccount
                } as JWT;
            }
            return token;
        }, async session({session, token, user}: { session: Session, token: JWT, user: User }) {
            session.user = token;
            return session;
        },
    },
    //
    pages: {
        signIn: "/",
        error: "/",
    }, secret: process.env.AUTH_SECRET,
    session: {
        strategy: "jwt"
    }
})


