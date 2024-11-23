import NextAuth, {Session, User} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {JWT} from "next-auth/jwt";
import prisma from "@/prisma/prisma";
import {handleAuthorization} from "@/lib/utils/authUtils/authUtils";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
import GoogleProvider from "next-auth/providers/google";
import {processJsonObject} from "@/lib/utils/parser/JsonObject";
import {UserPrivileges} from "@/types/JSON/user-privileges";
import {toGMT8} from "@/lib/utils/toGMT8";
import {devices} from "@/defaults_configurations/devices";

export const {handlers, signIn, signOut, auth, unstable_update} = NextAuth({
    providers: [Credentials({
        credentials: {
            username: {}, password: {},
        }, authorize: async (credentials) => {
            if (!credentials.username || !credentials.password) {
                throw new Error('Fields cannot be empty');
            }

            // Validate credentials
            const {username, password} = await LoginValidation.parseAsync(credentials as {
                username: string; password: string;
            });

            // Handle user authorization
            return await handleAuthorization({username, password});
        },
    }), GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET, authorization: {
            params: {
                prompt: "consent", access_type: "offline", response_type: "code",
            },
        },
    }),], callbacks: {
        async signIn({ account, user }) {
            // // console.time("signInProcess");

            try {
                if (account?.provider === "google") {
                    // // console.time("GoogleAuthCheck");

                    const results = await prisma.$transaction([
                        prisma.trans_employees.findUnique({
                            where: { email: user.email || undefined },
                        }),
                        prisma.trans_users.findUnique({
                            where: { email: user.email! },
                        }),
                    ]);

                    const googleAuth = results[0];
                    const existingUser = results[1];

                    if (!googleAuth) {
                        console.error("Unauthorized login attempt.");
                        // // console.timeEnd("GoogleAuthCheck");
                        return false;
                    }

                    // Fetch access control details, privileges, and related data
                    const access_control = await prisma.acl_user_access_control.findFirst({
                        where: { employee_id: googleAuth.id },
                        include: {
                            sys_privileges: true,
                            trans_users: true,
                        },
                    });

                    // // console.timeEnd("GoogleAuthCheck");

                    // if (!access_control) {
                    //     console.error("Access control not found.");
                    //     return false;
                    // }


                    if (!googleAuth || !access_control) {
                        console.error("Unauthorized login attempt or access control missing.");
                        return false;
                    }

                    if (access_control.banned_til) {
                        const isBanned = toGMT8(access_control.banned_til).isAfter(new Date());
                        if (isBanned) {
                            console.log("You are banned");
                            return false;
                        }
                    }

                    const privileges = access_control.sys_privileges;
                    const accessibility = processJsonObject<UserPrivileges>(privileges?.accessibility);
                    if (!accessibility?.web_access) {
                        console.log("No web access");
                        return false;
                    }

                    console.log("Control: ", access_control);

                    // console.time("UpsertUser");

                    const updatedUser = await prisma.auth_accounts.upsert({
                        where: {
                            provider_provider_account_id: {
                                provider: account.provider,
                                provider_account_id: account.providerAccountId,
                            },
                        },
                        create: {
                            provider: account.provider,
                            provider_account_id: account.providerAccountId,
                            access_token: account.access_token,
                            refresh_token: account.refresh_token,
                            scope: account.scope,
                            expires_at: account.expires_at,
                            id_token: account.id_token,
                            type: account.type,
                            token_type: account.token_type,
                            updatedAt: new Date(),
                            trans_users: {
                                connectOrCreate: {
                                    where: { email: user.email! },
                                    create: {
                                        email: user.email!,
                                        name: user.name!,
                                        image: user.image,
                                        updatedAt: new Date(),
                                        createdAt: new Date(),
                                    },
                                },
                            },
                        },
                        update: {
                            access_token: account.access_token,
                            refresh_token: account.refresh_token,
                            scope: account.scope,
                            expires_at: account.expires_at,
                            id_token: account.id_token,
                            updatedAt: new Date(),
                            trans_users: {
                                update: {
                                    where: { email: user.email! },
                                    data: {
                                        name: existingUser?.name || user.name!,
                                        image: existingUser?.image || user.image,
                                        updatedAt: new Date(),
                                    },
                                },
                            },
                        },
                    });
                    // console.timeEnd("UpsertUser");
                    console.time("UpsertACL")
                    await prisma.acl_user_access_control.update({
                        where:{
                            id: access_control.id
                        }, data: {
                            user_id:updatedUser.userId
                        }
                    })
                    console.timeEnd("UpsertACL")
                    user.id = String(updatedUser.userId);
                    console.log("user id: ", user.id)
                    if (existingUser) {
                        user.email = existingUser.email;
                        user.name = existingUser.name;
                        user.image = existingUser.image;
                    }

                    // console.time("DeviceUpdate");
                    await devices(updatedUser.userId);
                    // console.timeEnd("DeviceUpdate");

                    // console.timeEnd("signInProcess");
                    return true;
                } else {
                    // console.time("DeviceUpdate");
                    await devices(user.id!);
                    // console.timeEnd("DeviceUpdate");

                    // console.timeEnd("signInProcess");
                    return true;
                }
            } catch (error) {
                console.error("Login error:", error);
                // console.timeEnd("signInProcess");
                return false;
            }
        }
        , authorized({request: {nextUrl}, auth}) {
            const isLoggedIn = !!auth?.user
            const {pathname} = nextUrl
            if (pathname.startsWith('/auth/signin') && isLoggedIn) {
                return Response.redirect(new URL('/', nextUrl))
            }
            return !!auth
        }, async jwt({token, user}) {
            if (user) {
                return {
                    ...token,
                    employee_id: user.employee_id,
                    image: user.image,
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    privilege: user.privilege,
                    isDefaultAccount: user.isDefaultAccount,
                } as JWT;
            }
            return token;
        }, async session({session, token}: { session: Session; token: JWT; user: User }) {

            session.user = token;
            return session;
        },
    }, pages: {
        signIn: "/", // Sign-in page route
        error: "/",  // Error page route
    }, secret: process.env.AUTH_SECRET, session: {
        strategy: "jwt", // Using JWT for session strategy
    },
});
