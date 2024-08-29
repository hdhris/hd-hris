import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow access to public assets and specific routes
    if (
        pathname === '/' || // Root page
        pathname === '/layout' || // Layout page (if applicable in routing)
        pathname === '/globals.css' || // Global CSS file
        pathname.startsWith('/_next/') || // Skip Next.js static files and images
        pathname === '/favicon.ico' || // Favicon
        pathname.startsWith('/api/auth') || // API and auth routes
        pathname.startsWith('/public/') || // Skip anything in the public folder
        pathname.startsWith('/public') || // Skip anything in the public folder
        pathname.startsWith('/site.webmanifest') || // Skip site.webmanifest
        pathname.startsWith('/forgot') || // Skip forgot
        pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/) // Skip common static files
    ) {
        return NextResponse.next();
    }



    // Check for authentication token
    const token = await getToken({ req });

    // If no token is found, redirect to login
    if (!token) {
        const loginUrl = new URL('/api/auth/signin', req.url);
        return NextResponse.redirect(loginUrl);
    }
}

// export const config = {
//     matcher: [
//         '/((?!_next/static|_next/image|favicon.ico|api/auth|globals.css|layout|public/).*)',
//         '/:path*',
//     ],
// };
