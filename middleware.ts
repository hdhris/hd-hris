import { NextResponse } from 'next/server';
import { auth } from "@/auth";

export default auth((req: any) => {
    const { pathname } = req.nextUrl;

    // Allow access to public assets and specific routes
    if (
        pathname === '/favicon.ico' || // Favicon
        pathname === '/globals.css' || // Global CSS file
        pathname.startsWith('/_next/') || // Skip Next.js static files and images
        pathname.startsWith('/public') || // Skip anything in the public folder
        pathname.startsWith('/api/auth') || // Allow API auth routes
        pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/) // Skip common static files
    ) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users to the login page (root)
    if (!req.auth) {
        if (pathname === '/') {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }

    // Check if the isDefaultAccount value is null or undefined
    if (req.auth.user.isDefaultAccount == null) {
        if (pathname === '/auth/login-checkpoint') {
            // Prevent access to login-checkpoint if isDefaultAccount is null or undefined
            return NextResponse.redirect(new URL("/", req.nextUrl.origin));
        }
        return NextResponse.next();
    }

    // If the user has a default account, force them to /auth/login-checkpoint and prevent access to other routes
    if (req.auth.user.isDefaultAccount) {
        if (pathname !== '/auth/login-checkpoint') {
            // Block access to any other page and redirect to /auth/login-checkpoint
            return NextResponse.redirect(new URL("/auth/login-checkpoint", req.nextUrl.origin));
        }
        // Allow access to /auth/login-checkpoint if the user is already there
        return NextResponse.next();
    }

    // If user is authenticated and does not have a default account, allow access
    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|globals.css|public/|api/auth).*)', // Exclude public and API auth routes
        '/auth/login-checkpoint', // Ensure login checkpoint is included in the matching
        '/:path*'
    ],
};
