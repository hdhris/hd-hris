import { NextResponse } from 'next/server';
import { auth } from "@/auth";

export default auth((req: any) => {
    const { pathname } = req.nextUrl;

    // Allow access to public assets and specific routes
    if (
        pathname === '/' || // Root page
        pathname === '/layout' || // Layout page
        pathname === '/globals.css' || // Global CSS file
        pathname.startsWith('/_next/') || // Skip Next.js static files and images
        pathname === '/favicon.ico' || // Favicon
        pathname.startsWith('/api/auth') || // API and auth routes
        pathname.startsWith('/public') || // Skip anything in the public folder
        pathname.startsWith('/site.webmanifest') || // Skip site.webmanifest
        pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/) // Skip common static files
    ) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users to the login page (except public routes)
    if (!req.auth) {
        return NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl.origin));
    }

    // Allow access to /auth/login-checkpoint if the user is authenticated and has a default account
    if (req.auth.user.isDefaultAccount && pathname === '/auth/login-checkpoint') {
        return NextResponse.next();
    }

    // Redirect users with default accounts to /auth/login-checkpoint
    if (req.auth.user.isDefaultAccount && pathname !== '/auth/login-checkpoint') {
        return NextResponse.redirect(new URL("/auth/login-checkpoint", req.nextUrl.origin));
    }

    return NextResponse.next(); // Proceed if authenticated and non-default account
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/auth|globals.css|layout|public/).*)',
        '/auth/login-checkpoint',
        '/:path*',
        '/public/assets/(.*)',
        '/public/notification-sounds/(.*)'
    ],
};