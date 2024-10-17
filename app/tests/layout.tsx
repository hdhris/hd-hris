"use client"
import React from 'react';
import { useIsClient } from '@/hooks/ClientRendering';
import Loading from "@/components/spinner/Loading";

const ClientOnlyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isClient = useIsClient();

    if (!isClient) {
        // Render loading state or empty while on the server
        return <Loading/>; // Customize this to suit your app (or render nothing)
    }

    return <div className="h-screen">{children}</div>; // Render children once it's confirmed that we're on the client
};

export default ClientOnlyLayout;
