import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {Providers} from "@/components/providers/Providers";
import React from "react";
import Debug from "@/components/debugging/Debug";
import Footer from "@/components/footer/Footer";
import {Case, Default, Switch} from "@/components/common/Switch";
import MaintenanceBreak from "@/components/maintainance/Maintenance";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import {Toaster} from "@/components/ui/toaster";



const inter = Inter({subsets: ["latin"]});
const isMaintenanceMode = process.env.MAINTAINANCE_MODE;
let title = ""
if (isMaintenanceMode === "true") {
    title = `${process.env.APP_NAME} | Maintenance Mode`
} else {
    title = `${process.env.APP_NAME} | Streamlining Payroll Management for Effortless Precision`
}
export const metadata: Metadata = {
    title,
    description: "WageWise is an online payslip system that helps businesses streamline payslip processes and improve performance.",
    icons: {
        icon: '/favicon.ico', apple: '/apple-touch-icon.png', shortcut: '/favicon.ico',
    },
    manifest: '/site.webmanifest',
};


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (<html lang="en">
    <body>
    <Providers className={inter.className}>

        <Debug/>
        <Switch expression={isMaintenanceMode!}>
            <Case of={"true"}>
                <MaintenanceBreak/>
            </Case>
            <Default>
                {/*<Update/>*/}
                {children}
            </Default>
        </Switch>
        {/*<Footer/>*/}
        <SpeedInsights/>
        <Analytics/>
    </Providers>
    <Toaster />

    </body>
    </html>);
}

