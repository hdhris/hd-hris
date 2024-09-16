// import NextAuth, {User} from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
//
// const getUserData = (username: string, password: string): User | null => {
//     if (username === "admin" && password === "adminadmin") {
//         return {
//             isAdmin: true,
//             picture: "https://avatars.githubusercontent.com/u/30373425?v=4",
//             role: "HR Manager",
//             id: "1",
//             name: "John Doe"
//
//         }
//     }
//     return null
//
// }
// export const {auth, handlers, signIn, signOut} = NextAuth({
//     providers: [CredentialsProvider({
//         name: "Credentials", credentials: {
//             username: {}, password: {}
//         }, async authorize(credentials, req): Promise<User | null> {
//             if (!credentials?.username || !credentials?.password) throw new Error('Fields cannot be empty');
//
//             const {username, password} = await LoginValidation.parseAsync(credentials);
//             // const encryptPass = Hash.validate(password) ? hash.decryptData(password) : null
//             // console.log(encryptPass);
//             const user = getUserData(username, password);
//             if (!user) throw new Error('Invalid Account');
//             // const verifyPassword = await bcrypt.compare(credentials.password, user.password)
//
//             // return verifyPassword ? JSON.parse(JSON.stringify(user)) : null;
//             return user ? JSON.parse(JSON.stringify(user)) : null
//         }
//     })], callbacks: {
//         async jwt({token, user, user-session}) {
//             if (user) {
//                 return {
//                     ...token,
//                     role: user.isAdmin ? "admin" : "user",
//                     picture: user.picture,
//                     id: user.id,
//                     name: user.name,
//                     isAdmin: user.isAdmin
//                 };
//             }
//             return token;
//         }, async user-session({user-session, token, user}) {
//             user-session.user = token;
//             return user-session;
//         }
//     }, pages: {
//         signIn: "/",
//     }, secret: process.env.NEXTAUTH_SECRET, user-session: {
//         strategy: "jwt", // maxAge: 60 * 60, // Set max age to 1 hour (3600 seconds)
//         // updateAge: 5 * 60,  // Update JWT every 5 minutes if activity is detected
//     },
// })
//
