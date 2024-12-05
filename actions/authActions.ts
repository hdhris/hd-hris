"use server";

import {signIn, signOut} from '@/auth';
import {
    PrismaClientInitializationError,
    PrismaClientUnknownRequestError,
    PrismaClientValidationError
} from '@prisma/client/runtime/library';
import {AuthError} from "next-auth";
import {ZodError} from "zod";

type Login = {
    username: string; password: string;
};


export async function login({username, password}: Login) {
    try {
        // Perform the sign-in
        const result = await signIn("credentials", {username, password, redirect: false});

        // Check if the sign-in was successful
        if (!result || result.error) {
            // If sign-in fails, return a user-friendly error message
            return {error: {message: "Invalid username or password. Please try again."}};
        }

        // If sign-in is successful, handle the redirect
        return {success: true};

    } catch (e) {
        console.log("Error: ", e)
        // if (e instanceof Prisma.PrismaClientValidationError) {
        //     console.error("Prisma Validation Error:", e.message);
        //     return {
        //         error: { message: "There was an error processing your request. Please try again later." }
        //     };
        // }
        if (e instanceof AuthError) {
            switch (e.type) {
                case "CredentialsSignin":
                    return {error: {message: "Invalid username or password. Please try again."}};

                case "CallbackRouteError":
                    if (e.cause?.err instanceof ZodError) {
                        return {
                            error: {message: "Invalid input. Please check all fields and try again."}
                        };
                    } else if (e.cause?.err instanceof PrismaClientValidationError) {
                        return {
                            error: {message: "There was an error processing your request. Please try again later."}
                        }
                    } else if (e.cause?.err instanceof PrismaClientInitializationError) {
                        return {
                            error: {message: "Can't reach database server. Please try again later."}
                        }
                    } else if(e.cause?.err instanceof PrismaClientUnknownRequestError) {
                        return {
                            error: {message: "Can't reach database server. Please try again later."}
                        }
                    }
                    else {
                        return {
                            error: {message: e.cause?.err?.message || "An unexpected error occurred. Please try again later."}
                        };
                    }

                default:
                    console.error("Error occurred: ", e);
                    return {error: {message: "An unexpected error occurred. Please try again later."}};
            }
        }

        console.error("Unexpected error:", e);
        return {error: {message: "An error occurred while processing your request. Please try again."}};
    }
}


export async function doSocialLogin() {
    await signIn("google", {redirectTo: "/dashboard"},);
}

export async function logout() {
    await signOut({redirectTo: "/auth/login"});
}
