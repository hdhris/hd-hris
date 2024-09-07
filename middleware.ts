import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt'
import {auth} from "@/auth";


export default auth((req: any) => {
    const { pathname } = req.nextUrl;

    // Allow access to public assets and specific routes
    if (
        pathname === '/' || // Root page
        pathname === '/layout' || // Layout page (if applicable in routing)
        pathname === '/globals.css' || // Global CSS file
        pathname.startsWith('/_next/') || // Skip Next.js static files and images
        pathname === '/favicon.ico' || // Favicon
        pathname.startsWith('/api/auth') || // API and auth routes
        pathname.startsWith('/public') || // Skip anything in the public folder
        pathname.startsWith('/public') || // Skip anything in the public folder
        pathname.startsWith('/site.webmanifest') || // Skip site.webmanifest
        pathname.startsWith('/forgot') || // Skip forgot
        pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/) // Skip common static files
    ) {
        return NextResponse.next();
    }
    if (!req.auth && req.nextUrl.pathname !== "/api/auth/signin") {
        const newUrl = new URL("/api/auth/signin", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }
})



export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/auth|globals.css|layout|public/).*)',
        '/:path*', '/public/assets/(.*)', '/public/notification-sounds/(.*)'
    ],
};