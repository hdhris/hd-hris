import {DefaultSession, DefaultUser} from "next-auth";
import {Key} from "react";
import {UserSettings} from "@/types/preferences/user-preferences-types";

declare module "next-auth" {
    interface Session {
        accessToken: string;
        user: {
            id: string;
            employee_id: Key
            name: string
            role: string; 
            image: string;
            privilege: string;
            modulePaths: string[];
            isDefaultAccount: boolean,
            userSettings: UserSettings
        } & DefaultSession["user"];

    }

    interface Session {
        id: string;
        employee_id: Key
        name: string
        role: string;
        image: string
        privilege: string;
        modulePaths: string[];
        isDefaultAccount: boolean
        userSettings: UserSettings
    }

    interface User extends DefaultUser {
        id: string;
        employee_id: Key
        name: string
        role: string;
        image: string
        privilege: string;
        modulePaths: string[];
        isDefaultAccount: boolean
        userSettings: UserSettings
    }

    interface User extends DefaultUser {
        id: string;
        employee_id: Key
        name: string
        role: string;
        image: string
        privilege: string;
        modulePaths: string[];
        isDefaultAccount: boolean
        userSettings: UserSettings
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
        modulePaths: string[];
        isDefaultAccount: boolean
        userSettings: UserSettings
    }
}
