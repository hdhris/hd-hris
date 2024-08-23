'use client'

import {NextUIProvider} from '@nextui-org/react'
import React from "react";
import {SessionProvider} from "next-auth/react";
import SWRProvider from "@/components/providers/SWRProvider";
import {useRouter} from 'next/navigation'
export function Providers({children, className}: { children: React.ReactNode, className?: string }) {
    const router = useRouter();
    return (<SessionProvider>
        <SWRProvider>
            <NextUIProvider className={className} navigate={router.push}>
                {children}
            </NextUIProvider>
        </SWRProvider>
        </SessionProvider>)
}