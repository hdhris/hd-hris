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
import localFont from 'next/font/local'
// import DbConnection from "@/components/DBConnection";
// import PrelineScript from "@/components/preline/PrelineScript";
// import Script from "next/script";

// const inter = Inter({subsets: ["latin"]});
const inter_local = localFont({
    src: "./fonts/inter/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2",
    display: "swap",

})
const isMaintenanceMode = process.env.MAINTAINANCE_MODE;
let title: string
if (isMaintenanceMode === "true") {
    title = `${process.env.APP_NAME} | Maintenance Mode`
} else {
    title = `${process.env.APP_NAME} | Streamlining Payroll Management for Effortless Precision`
}
export const metadata: Metadata = {
    title,
    description: "HDHRiS: An online payslip system that helps businesses streamline payslip processes and improve performance.",
    creator: 'France Jay D. Concepcion | John Rey E. Cuello | M. Nizam M. Datumanong',
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
        shortcut: '/favicon.ico',
    },
    manifest: '/site.webmanifest',
    openGraph: {
        title: "HDHRiS - Online Human Resource Information System",
        description: "Streamline your payslip processes and improve business performance with HDHRiS.",
        url: process.env.BASE_URL,
        type: "website",
        images: [
            {
                url: '/favicon.ico',
                width: 1200,
                height: 630,
                alt: "HDHRiS Online Payslip System",
            },
        ],
    },
};


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (<html lang="en">
    <body className={inter_local.className}>
    <Providers>
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

    {/*<DbConnection/>*/}
    <Toaster />
    </body>
    </html>);
}

