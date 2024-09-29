"use server";

import {signIn, signOut} from '@/auth';
import { AuthError } from "next-auth";
import { ZodError } from "zod";

type Login = {
    username: string;
    password: string;
};


export async function login({ username, password }: Login) {
    try {
        // Perform the sign-in
        const result = await signIn("credentials", { username, password, redirect: false });

        // Check if the sign-in was successful
        if (!result || result.error) {
            // If sign-in fails, return a user-friendly error message
            return { error: { message: "Invalid username or password. Please try again." } };
        }

        // If sign-in is successful, handle the redirect
        return { success: true };

    } catch (e) {
        if (e instanceof AuthError) {
            switch (e.type) {
                case "CredentialsSignin":
                    return { error: { message: "Invalid username or password. Please try again." } };

                case "CallbackRouteError":
                    console.log(e.cause?.err);

                    if (e.cause?.err instanceof ZodError) {
                        return {
                            error: { message: "Invalid input. Please check all fields and try again." }
                        };
                    } else {
                        return {
                            error: { message: e.cause?.err?.message || "An unexpected error occurred. Please try again later." }
                        };
                    }

                default:
                    console.log("Error occurred: ", e);
                    return { error: { message: "An unexpected error occurred. Please try again later." } };
            }
        }

        console.error("Unexpected error:", e);
        return { error: { message: "An error occurred while processing your request. Please try again." } };
    }
}


export async function doSocialLogin(){
    await signIn("google", {redirectTo: "/dashboard"}, );
}

export async function logout() {
    await signOut({redirectTo: "/"});
}
