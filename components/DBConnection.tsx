"use client";
import React, { useEffect, useState } from "react";
import prisma from "@/prisma/prisma";
import { useToast } from "@/components/ui/use-toast";

function DbConnection() {
    const { toast } = useToast();
    const [retryCount, setRetryCount] = useState(0); // Keep track of retries
    const [connected, setConnected] = useState(false); // Track connection status

    useEffect(() => {
        const connect = async () => {
            try {
                await prisma.$connect();
                console.log("Connected to the database successfully.");
                setConnected(true); // Mark as connected
                toast({
                    variant: "success",
                    title: "Database Connected",
                    description: "Successfully connected to the database.",
                });
            } catch (error) {
                console.log("Error while connecting:", error);
                toast({
                    variant: "danger",
                    title: "Error while connecting",
                    description: "Can't reach database server. Retrying in 5 seconds...",
                });

                // Retry after a delay
                setTimeout(() => {
                    setRetryCount((prev) => prev + 1); // Increment retry count
                }, 5000); // Retry every 5 seconds
            }
        };

        // Only retry up to a certain number of times (e.g., 5 retries) or until connected
        if (!connected && retryCount < 5) {
            connect();
        } else if (retryCount >= 5 && !connected) {
            toast({
                variant: "danger",
                title: "Connection failed",
                description: "Unable to connect to the database after multiple attempts.",
            });
        }
    }, [retryCount, toast, connected]); // Dependency array includes retryCount and connected

    return <></>;
}

export default DbConnection;
