import NextAuth, {Session} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {JWT} from "next-auth/jwt";
import {handleAuthorization} from "@/lib/utils/authUtils/authUtils";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
import {SignJWT} from "jose";
import {SupabaseAdapter} from "@auth/supabase-adapter"
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/prisma/prisma";


export const {handlers, signIn, signOut, auth} = NextAuth({
    adapter: SupabaseAdapter({
        url: process.env.SUPABASE_URL ?? "", secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    }), providers: [Credentials({
        credentials: {
            username: {}, password: {},
        }, authorize: async (credentials) => {
            // Type assertion to ensure correct type
            if (!credentials.username || !credentials.password) {
                throw new Error('Fields cannot be empty');
            }

            // Validate credentials
            const {username, password} = await LoginValidation.parseAsync(credentials as {
                username: string; password: string
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
    }),], callbacks: {
        async signIn({account, profile, user}) {
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

        }, async jwt({token, user}) {
            if (user) {
                return {
                    ...token,
                    picture: user.picture,
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    email: user.email,
                    privilege: user.privilege,
                    employee_id: user.employee_id,
                    isDefaultAccount: user.isDefaultAccount
                } as JWT;
            }

            return token;
        }, async session({session, token}: { session: Session, token: JWT }) {
            const signingSecret = process.env.SUPABASE_JWT_SECRET
            if (signingSecret) {
                const encoder = new TextEncoder();
                const secretKey = encoder.encode(signingSecret);
                const payload: JWT = {
                    employee_id: token.employee_id,
                    id: token.id,
                    isDefaultAccount: token.isDefaultAccount,
                    name: token.name,
                    picture: token.picture,
                    privilege: token.privilege,
                    aud: "authenticated",
                    exp: Math.floor(new Date(session.expires).getTime() / 1000),
                    sub: token.id as string, // Ensure `token.id` is a string
                    email: token.email ?? '', // Handle possible `null` or `undefined`
                    role: "authenticated"
                };

                // Sign the JWT
                session.accessToken = await new SignJWT(payload)
                    .setProtectedHeader({alg: 'HS256'})
                    .sign(secretKey);
            }
            session.user = token
            return session;
        },
    }, pages: {
        signIn: "/",
        error: "/"
    }, secret: process.env.AUTH_SECRET, session: {
        strategy: "jwt"
    }
})
