import NextAuth, {DefaultSession, DefaultUser} from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string
            role: string;
            picture: string
        } & DefaultSession["user"];

    }

    interface Session {
        id: string;
        name: string
        role: string;
        picture: string
    }

    interface User extends DefaultUser {
        id: string;
        name: string
        role: string;
        picture: string
    }

    interface User extends DefaultUser {
        id: string;
        name: string
        role: string;
        picture: string

    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        name: string
        role: string;
        picture: string
    }
}
