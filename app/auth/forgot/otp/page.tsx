'use client';
import React, { useEffect, useState } from 'react';
import Otp from "@/components/forgot/otp/Otp";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { uuidValidateV4 } from "@/lib/utils/uuid-validator/validator";

function Page() {
    const router = useRouter();
    const [isValid, setIsValid] = useState<boolean | null>(null);

    useEffect(() => {
        const token = getCookie('otp-token');
        const validate = uuidValidateV4(token as string);
        setIsValid(validate);

        if (!validate) {
            router.push('/auth/forgot');
        }
    }, [router]);

    // Prevent rendering until validation is complete
    if (isValid === null) return null;

    return (
        <main className="flex h-screen flex-col items-center">
            <Otp redirectOnSuccess="/auth/forgot/change" />
        </main>
    );
}

export default Page;
