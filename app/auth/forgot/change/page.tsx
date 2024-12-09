'use client';

import React, { useEffect } from 'react';
import ChangePassword from "@/components/forgot/change/ChangePassword";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { uuidValidateV4 } from "@/lib/utils/uuid-validator/validator";
// import { useIsClient } from "@/hooks/ClientRendering";

function Page() {
    const router = useRouter();
    const token = getCookie("change-password-token");
    const validateToken = uuidValidateV4(token as string);
    // const isClient = useIsClient();

    useEffect(() => {
        // if (!isClient) return;

        if (!validateToken) {
            console.log("Token invalid or expired, redirecting...");
            router.push("/auth/forgot");
            return;
        }

        // Handle token expiration logic
        const tokenCreationTime = getCookie("token-creation-time");
        const fiveMinutes = 5 * 60 * 1000;

        if (!tokenCreationTime) {
            // Set token creation time if not set
            setCookie("token-creation-time", Date.now());
        } else {
            const elapsedTime = Date.now() - Number(tokenCreationTime);
            if (elapsedTime >= fiveMinutes) {
                // If token has expired, delete cookies and redirect
                deleteCookie("change-password-token");
                deleteCookie("token-creation-time");
                console.log("Token expired, redirecting...");
                router.push("/auth/forgot");
            }
        }
    }, [validateToken, router]);

    // Wait for client-side rendering to avoid server-side mismatches
    // if (!isClient) return null;

    return (
        <main className="flex h-screen flex-col items-center">
            <ChangePassword />
        </main>
    );
}

export default Page;
