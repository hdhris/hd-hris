import { NextResponse } from 'next/server';
import { auth } from "@/auth";

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
            return NextResponse.next(); // Allow access to login and forgot password routes
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
