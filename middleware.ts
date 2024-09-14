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
        pathname === "/auth/login" ||
        pathname.startsWith('/api/auth') || // API and auth routes
        pathname.startsWith('/public') || // Skip anything in the public folder
        pathname.startsWith('/site.webmanifest') || // Skip site.webmanifest
        pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/) // Skip common static files
    ) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users to the login page
    if (!req.auth) {
        const newUrl = new URL("/api/auth/signin", req.nextUrl.origin);
        return NextResponse.redirect(newUrl);
    }

    // Ensure users cannot access the login-checkpoint if unauthenticated
    if (req.nextUrl.pathname === "/auth/login-checkpoint" && !req.auth.user.isDefaultAccount) {
        return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }

    return NextResponse.next(); // Proceed if authenticated
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/auth|globals.css|layout|public/).*)', // Main protected routes
        '/auth/login-checkpoint', // Explicitly check this route
        '/:path*', // Catch-all routes
        '/public/assets/(.*)', // Public assets
        '/public/notification-sounds/(.*)', // Public sounds
    ],
};
