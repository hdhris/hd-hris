"use client"
import {useRouter} from "next/navigation";
import Login from "@/components/login/Login";
import {auth} from "@/auth";
import ReCaptchaProvider from "@/components/providers/GoogleRecaptcha";
import {useSession} from "next-auth/react";

export default function Home() {
    const session = useSession();
    const router = useRouter()
    if (session) {
        router.replace("/dashboard")
    }

    return (<main className="flex h-screen flex-col items-center">
        <ReCaptchaProvider>
            <Login/>
        </ReCaptchaProvider>
    </main>);
}
