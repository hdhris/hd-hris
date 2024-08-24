'use client'
import React, {useEffect} from 'react';
import Otp from "@/components/forgot/otp/Otp";
import {getCookie} from "cookies-next";
import {redirect, useRouter} from "next/navigation";

function Page() {
    const router = useRouter();

    useEffect(() => {
        // Fetch cookie client-side
        const email = getCookie('email');

        if (!email) {
            router.push('/forgot');
        }
    }, [router]);

    return (
        <main className="flex h-screen flex-col items-center">
            <Otp/>
        </main>
    );
}

export default Page;