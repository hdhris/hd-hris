// import type {NextRequest} from 'next/server';
// import {NextResponse} from 'next/server';
// import {getToken} from 'next-auth/jwt';
//
// export async function middleware(req: NextRequest) {
//
//     const token = await getToken({req});
//     // If the user is not authenticated, redirect to the login page
//     if (!token) {
//         const loginUrl = new URL('/', req.url);
//         return NextResponse.redirect(loginUrl);
//     }
//
//     // Allow the request to proceed
//     return NextResponse.next();
// }
//
// // Apply the middleware to all routes within the `(admin)` group
// export const config = {
//     matcher: ['/attendance-time/:path*', '/dashboard/:path*', '/employeemanagement/:path*', '/privileges/:path*', '/account', '/settings', '/backup', '/help&support', '/integrations', '/preferences', '/privacy', '/security', '/terms&condition',],
// };


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith('/api/auth/signin')) {
        return NextResponse.next();
    }
    const token = await getToken({ req });

    // If the user is not authenticated, redirect to the login page
    if (!token) {
        const loginUrl = new URL('/', req.url);
        return NextResponse.redirect(loginUrl);
    }

    // Allow the request to proceed
    return NextResponse.next();
}

// Apply the middleware to all routes within the `admin` route
export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};

