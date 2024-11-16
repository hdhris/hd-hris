import {DefaultSession, DefaultUser} from "next-auth";
import {Key} from "react";

declare module "next-auth" {
    interface Session {
        accessToken: string;
        user: {
            id: string;
            employee_id: Key
            name: string
            role: string; image: string
            privilege: string;
            isDefaultAccount: boolean
        } & DefaultSession["user"];

    }

    interface Session {
        id: string;
        employee_id: Key
        name: string
        role: string;
        image: string
        privilege: string;
        isDefaultAccount: boolean
    }

    interface User extends DefaultUser {
        id: string;
        employee_id: Key
        name: string
        role: string;
        image: string
        privilege: string;
        isDefaultAccount: boolean
    }

    interface User extends DefaultUser {
        id: string;
        employee_id: Key
        name: string
        role: string;
        image: string
        privilege: string;
        isDefaultAccount: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        employee_id: Key
        name: string
        role: string;
        image: string;
        privilege: string;
        isDefaultAccount: boolean
    }
}
