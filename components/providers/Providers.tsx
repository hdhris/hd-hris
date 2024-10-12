'use client'

import {NextUIProvider} from '@nextui-org/react'
import React from "react";
import {SessionProvider} from "next-auth/react";
import SWRProvider from "@/components/providers/SWRProvider";
import {useRouter} from 'next/navigation'
import {EdgeStoreProvider} from "@/lib/edgestore/edgestore";

export function Providers({children, className}: { children: React.ReactNode, className?: string }) {
    const router = useRouter();
    return (<EdgeStoreProvider>
        <SessionProvider>
            <SWRProvider>
                <NextUIProvider navigate={router.push}>
                    {children}
                </NextUIProvider>
            </SWRProvider>
        </SessionProvider>
    </EdgeStoreProvider>)
}