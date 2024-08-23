'use client'
import React, {useRef} from 'react';
import Otp from "@/components/forgot/otp/Otp";
import ChangePassword from "@/components/forgot/change/ChangePassword";
import {getCookie} from "cookies-next";
import {redirect, useRouter} from "next/navigation";

function Page() {
    const router = useRouter();
    const email = getCookie('email');
    const otp = getCookie('otp');
    if(!email){
        router.push('/forgot')
    }

    if(!otp){
        router.push('/forgot/otp')
    }
    return (
        <main className="flex h-screen flex-col items-center">
            <ChangePassword/>
        </main>
    );
}

export default Page;