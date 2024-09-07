"use server"

import {signIn, signOut} from '@/auth'

import {AuthError} from "next-auth";

type Login = {
    username: string
    password: string
}

export async function login({username, password}: Login) {

    try {
        await signIn("credentials", {username, password, redirectTo: "/dashboard"});
    } catch (e) {
        if (e instanceof AuthError) {
            switch (e.type) {
                case "CredentialsSignin":
                    return {error: {message: e.cause?.err?.message || "Invalid username or password"}};
                case "CallbackRouteError":
                    return {
                        error: {
                            message: e.cause?.err?.message || "Something went wrong"
                        }
                    }
                default:
                    return {error: {message: "Something went wrong"}}
            }
        }

        console.error(e)
        throw e

    }
}

export async function logout() {
    await signOut({redirectTo: "/"})
}
