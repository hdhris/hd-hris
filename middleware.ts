import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import {notFound} from "next/navigation";

export default auth((req: any) => {
    const { pathname } = req.nextUrl;

    // Allow access to public assets and specific routes
    if (
        pathname === '/favicon.ico' ||
        pathname === '/globals.css' ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/public') ||
        pathname.startsWith('/api/auth') ||
        pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/)
    ) {
        return NextResponse.next();
    }

    // Allow api access to mobile
    if (
        pathname.startsWith('/api/mobile')

    ) {
        return NextResponse.next();
    }


    if(pathname === "/"){
        return NextResponse.redirect(new URL("/auth/login", req.nextUrl.origin));
    }

    // Redirect unauthenticated users to the login page (root)
    if (!req.auth) {
        if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth') || pathname.startsWith('/auth/forgot')) {
            return NextResponse.next(); // Allow access to log in and forgot password routes
        }
        return NextResponse.redirect(new URL("/auth/login", req.nextUrl.origin));
    }

    // Check if the isDefaultAccount value is null or undefined
    // if (req.auth.user.isDefaultAccount == null) {
    //     if (pathname === '/auth/login-checkpoint') {
    //         return NextResponse.redirect(new URL("/auth/login", req.nextUrl.origin));
    //     }
    //     return NextResponse.next();
    // }

    // If the user has a default account, force them to /auth/login-checkpoint
    if (req.auth.user.isDefaultAccount) {
        if (pathname !== '/auth/login-checkpoint') {
            return NextResponse.redirect(new URL("/auth/login-checkpoint", req.nextUrl.origin));
        }
        return NextResponse.next();
    }

    // Validate user privileges against the stored paths
    // const modulePaths: string[] = req.auth.user?.modulePaths || []; // Retrieve paths from auth
    // const isAuthorized = modulePaths.some((allowedPath) =>
    //     pathname.startsWith(allowedPath)
    // );

    // if (!isAuthorized) {
    //     // Redirect unauthorized users to an "unauthorized" page
    //     return NextResponse.redirect(new URL("/auth/unauthorized", req.nextUrl.origin));
    // }

    // If user is authenticated and does not have a default account, allow access
    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|globals.css|public/|api/auth).*)',
        '/auth/login-checkpoint',
        '/:path*'
    ],
};
