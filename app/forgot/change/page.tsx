'use client';
import React, { useEffect } from 'react';
import ChangePassword from "@/components/forgot/change/ChangePassword";
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

function Page() {
    const router = useRouter();

    useEffect(() => {
        // Fetch cookies client-side
        const email = getCookie('email');
        const otp = getCookie('otp');

        if (!email) {
            router.push('/forgot');
        } else if (!otp) {
            router.push('/forgot/otp');
        }
    }, [router]);

    return (
        <main className="flex h-screen flex-col items-center">
            <ChangePassword />
        </main>
    );
}

export default Page;
