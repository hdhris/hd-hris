import {DefaultSession, DefaultUser} from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string; name: string
            role: string; picture: string
            privilege: string; employee_id: number | null
        } & DefaultSession["user"];

    }

    interface Session {
        id: string;
        name: string
        role: string;
        picture: string
        privilege: string;
        employee_id: number | null
    }

    interface User extends DefaultUser {
        id: string;
        name: string
        role: string;
        picture: string
        privilege: string;
        employee_id: number | null
    }

    interface User extends DefaultUser {
        id: string;
        name: string
        role: string;
        picture: string
        privilege: string;
        employee_id: number | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        name: string
        role: string;
        picture: string;
        privilege: string;
        employee_id: number | null
    }
}
