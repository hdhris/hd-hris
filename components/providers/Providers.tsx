'use client'

import {NextUIProvider} from '@nextui-org/react'
import React from "react";
import {SessionProvider} from "next-auth/react";
import SWRProvider from "@/components/providers/SWRProvider";

export function Providers({children, className}: { children: React.ReactNode, className?: string }) {
    return (<SessionProvider>
        <SWRProvider>
            <NextUIProvider className={className}>
                {children}
            </NextUIProvider>
        </SWRProvider>
        </SessionProvider>)
}