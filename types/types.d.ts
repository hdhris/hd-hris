import {DefaultSession, DefaultUser} from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string; name: string
            role: string; picture: string
            privilege: string; employee_id: number | null
            isDefaultAccount: boolean
        } & DefaultSession["user"];

    }

    interface Session {
        id: string;
        name: string
        role: string;
        picture: string
        privilege: string;
        employee_id: number | null
        isDefaultAccount: boolean
    }

    interface User extends DefaultUser {
        id: string;
        name: string
        role: string;
        picture: string
        privilege: string;
        employee_id: number | null
        isDefaultAccount: boolean
    }

    interface User extends DefaultUser {
        id: string;
        name: string
        role: string;
        picture: string
        privilege: string;
        employee_id: number | null
        isDefaultAccount: boolean
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
        isDefaultAccount: boolean
    }
}
