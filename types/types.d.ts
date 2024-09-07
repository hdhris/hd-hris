import NextAuth, {DefaultSession, DefaultUser} from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            isAdmin: boolean;
            name: string
            role: string;
            picture: string
        } & DefaultSession["user"];

    }

    interface Session {
        id: string;
        isAdmin: boolean;
        name: string
        role: string;
        picture: string
    }

    interface User extends DefaultUser {
        id: string;
        isAdmin: boolean;
        name: string
        role: string;
        picture: string
    }

    interface User extends DefaultUser {
        id: string;
        isAdmin: boolean;
        name: string
        role: string;
        picture: string

    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        isAdmin: boolean;
        name: string
        role: string;
        picture: string
    }
}
