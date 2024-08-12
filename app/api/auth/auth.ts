import {NextAuthOptions, User} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
import {formatFullName} from "@/lib/utils/nameFormatter";


const getUserData = (username: string, password: string): User | null => {
    if(username === "admin" && password === "adminadmin"){
        return {
            isAdmin: true,
            picture: "https://avatars.githubusercontent.com/u/30373425?v=4",
            role: "HR Manager",
            id: "1",
            name: "John Doe"

        }
    } return null

}

const authOptions: NextAuthOptions = {
    providers: [CredentialsProvider({
        name: "Credentials", credentials: {
            username: {}, password: {}
        }, async authorize(credentials, req): Promise<User | null> {
            if (!credentials?.username || !credentials?.password) throw new Error('Fields cannot be empty');

            const {username, password} = await LoginValidation.parseAsync(credentials);
            // const encryptPass = Hash.validate(password) ? hash.decryptData(password) : null
            // console.log(encryptPass);

            const user = getUserData(username, password);
            console.log(user)
            if (!user) throw new Error('Invalid Account');
            // const verifyPassword = await bcrypt.compare(credentials.password, user.password)

            // return verifyPassword ? JSON.parse(JSON.stringify(user)) : null;
            return null
        }
    })], callbacks: {
        async jwt({token, user, session}) {
            if (user) {
                return {
                    ...token,
                    role: user.role,
                    picture: user.picture,
                    id: user.id,
                    name: user.name,
                    isAdmin: user.isAdmin
                };
            }
            return token;
        }, async session({session, token, user}) {
            session.user = token;
            return session;
        }
    },
    pages: {
        signIn: "/",
    },
    secret: process.env.NEXTAUTH_SECRET, session: {
        strategy: "jwt"
    },
}

export default authOptions