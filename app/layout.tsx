import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import Providers from "@/components/provider/Providers";
import Debug from "@/components/debugging/Debug";


const inter = Inter({subsets: ["latin"]});

// Environment variables
const APP_NAME = process.env.APP_NAME;
// const DEBUG = process.env.APP_NAME === 'true';

export const metadata: Metadata = {
  title: `${APP_NAME} | Streamlining Payroll Management for Effortless Precision`,
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

  return (
      <html lang="en" suppressHydrationWarning>
      <body>
      <Providers className={inter.className}>
        <Debug />
        {children}
      </Providers>
      </body>
      </html>
  );
}
