'use client'
import React from 'react';
import Otp from "@/components/forgot/otp/Otp";
import {getCookie} from "cookies-next";
import {redirect, useRouter} from "next/navigation";

function Page() {
    const router = useRouter();
    const email = getCookie('email');
    if(!email){
        router.push('/forgot')
    }
    return (
        <main className="flex h-screen flex-col items-center">
            <Otp/>
        </main>
    );
}

export default Page;