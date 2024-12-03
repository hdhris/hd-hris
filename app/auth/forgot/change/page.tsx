'use client'
import React, {useEffect} from 'react';
import ChangePassword from "@/components/forgot/change/ChangePassword";
import {deleteCookie, getCookie, setCookie} from "cookies-next";
import {useRouter} from "next/navigation";
import {uuidValidateV4} from "@/lib/utils/uuid-validator/validator";
import {useIsClient} from "@/hooks/ClientRendering";

function Page() {
    const router = useRouter();
    const token = getCookie("change-password-token");
    const validate_token = uuidValidateV4(token as string)
    const isClient = useIsClient()


    useEffect(() => {
        // Get the token creation time
        const tokenCreationTime = getCookie("token-creation-time");

        // If no creation time exists, set it to the current time
        if (!tokenCreationTime) {
            setCookie("token-creation-time", Date.now());
        } else {
            const elapsedTime = Date.now() - Number(tokenCreationTime);
            const fiveMinutes = 5 * 60 * 1000;

            // If 5 minutes have passed, delete the token
            if (elapsedTime >= fiveMinutes) {
                deleteCookie("change-password-token");
                deleteCookie("token-creation-time");
            }
        }
    }, []);

    if (!validate_token) {
        router.push("/auth/forgot");
        console.log("Ive been there...")
        return;
    }

    if(!isClient) return null

    return (<main className="flex h-screen flex-col items-center">
            <ChangePassword/>
        </main>);
}

export default Page;