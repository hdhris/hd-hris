'use client'
import React, {useEffect} from 'react';
import Otp from "@/components/forgot/otp/Otp";
import {getCookie} from "cookies-next";
import {useRouter} from "next/navigation";
import {uuidValidateV4} from "@/lib/utils/uuid-validator/validator";
import {useIsClient} from "@/hooks/ClientRendering";

function Page() {
    const router = useRouter();
    const token = getCookie('otp-token');
    const validate = uuidValidateV4(token as string)
    const isClient = useIsClient()
    if (!validate) {
        router.push('/auth/forgot');
        return
    }


    if(!isClient) return null
    return (
        <main className="flex h-screen flex-col items-center">
            <Otp redirectOnSuccess="/auth/forgot/change"/>
        </main>
    );
}

export default Page;