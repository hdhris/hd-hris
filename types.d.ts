import {type DefaultSession} from "next-auth";

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's postal address. */
            id: string;
            isAdmin: boolean;
            name: string
            role: string;
            picture: string
            /**
             * By default, TypeScript merges new interface properties and overwrites existing ones.
             * In this case, the default session user properties will be overwritten,
             * with the new ones defined above. To keep the default session user properties,
             * you need to add them back into the newly declared interface.
             */
        } & DefaultSession["user"] & AdapterUser
    }
}
declare module "next-auth" {
    /**
     * The shape of the user object returned in the OAuth providers' `profile` callback,
     * or the second parameter of the `session` callback, when using a database.
     */
    interface User {
        id: string;
        isAdmin: boolean;
        name: string
        role: string;
        picture: string
        privilege: string

    }
    /**
     * The shape of the account object returned in the OAuth providers' `account` callback,
     * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
     */
    interface Account {
        id: string;
        isAdmin: boolean;
        name: string
        role: string;
        picture: string
        privilege: string
    }

    /**
     * Returned by `useSession`, `auth`, contains information about the active session.
     */
    interface Session{
        id: string;
        isAdmin: boolean;
        name: string
        role: string;
        picture: string
        privilege: string
    }

    interface AdapterUser {
        id: string;
        isAdmin: boolean;
        name: string
        role: string;
        picture: string
        privilege: string
    }
}

// The `JWT` interface can be found in the `next-auth/jwt` submodule
import { JWT } from "next-auth/jwt"
import {AdapterUser} from "@auth/core/adapters";
import {DefaultJWT} from "@auth/core/jwt";

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT extends DefaultJWT{
        /** OpenID ID Token */
        id: string;
        isAdmin: boolean;
        name: string
        role: string;
        picture: string
        privilege: string
        idToken?: string
    }

    interface User extends AdapterUser{
        id: string;
        isAdmin: boolean;
        name: string
        role: string;
        picture: string
        privilege: string
    }
}