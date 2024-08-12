'use client'
import React from 'react';
import {NextUIProvider} from "@nextui-org/react";
// import {SessionProvider} from "next-auth/react";

interface Props {
    children: React.ReactNode;
    className?: string;
}

function Providers({children, className}: Props) {
    return (
        // <SessionProvider>
            <NextUIProvider className={className}>
                {children}
            </NextUIProvider>
        // </SessionProvider>
    );
}

export default Providers;