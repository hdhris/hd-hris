import NextAuth, {Session, User} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
import {JWT} from "next-auth/jwt";
import {PrismaAdapter} from "@auth/prisma-adapter";
import prisma from "@/prisma/prisma";
import Simple3Des from "@/lib/cryptography/3des";
import {formatFullName} from "@/lib/utils/nameFormatter";

const getUserData = async (username: string, password: string): Promise<User | null> => {


    // const des = new Simple3Des()
    // const decrypt = Simple3Des.validate(username) ? des.decryptData(username) : null
    // console.log(decrypt)
    const encrypt = new Simple3Des().encryptData(password)
    const data = await prisma.account.findFirst({
        select: {
            id: true, role: true, privilege: true, user: {
                select: {
                    picture: true,
                    firstName: true,
                    lastName: true,
                    middle_name: true,
                    extension: true,
                    pre_fix: true,
                    suffix: true,
                    email: true,
                }
            }
        }, where: {
            username: username, password: encrypt
        }
    })
    console.log(data)
    if (data) {
        const user = {
            isAdmin: data.role === "ADMIN",
            picture: data.user.picture!,
            role: data.role,
            id: data.id,
            name: formatFullName(data.user.pre_fix!, data.user.firstName, data.user.middle_name!, data.user.lastName, data.user.extension!, data.user.suffix!),
            privilege: "admin"
        }

        console.log(user)

        return user
    }

    // console.log("Data: ", data)
    // if (username === "admin" && password === "password123") {
    //
    //     return {
    //         isAdmin: true,
    //         picture: "https://avatars.githubusercontent.com/u/30373425?v=4",
    //         role: "HR Manager",
    //         id: "1",
    //         name: "John Doe",
    //         privilege: "admin"
    //
    //     }
    // }
    return null

}
export const {handlers, signIn, signOut, auth} = NextAuth({
    adapter: PrismaAdapter(prisma), providers: [Credentials({
        credentials: {
            username: {}, password: {},
        }, authorize: async (credentials) => {
            if (!credentials?.username || !credentials?.password) throw new Error('Fields cannot be empty');
//
            let user = null
            try {
                const {username, password} = await LoginValidation.parseAsync(credentials);
                // const encryptPass = Hash.validate(password) ? hash.decryptData(password) : null
                // console.log(encryptPass);
                user = getUserData(username, password);

                // const verifyPassword = await bcrypt.compare(credentials.password, user.password)


            } catch (e) {
                console.log(e)
                if (!user) throw new Error('Invalid username or password');
                // console.log(e)
            }


            // return verifyPassword ? JSON.parse(JSON.stringify(user)) : null;
            return user ? JSON.parse(JSON.stringify(user)) : null
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
                    ...token,
                    role: user.isAdmin ? "admin" : "user",
                    picture: user.picture,
                    id: user.id,
                    name: user.name,
                    isAdmin: user.isAdmin
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