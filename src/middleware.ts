import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;
    const isApproved = req.auth?.user?.isApproved;

    const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/signup';
    const isAdminPage = nextUrl.pathname.startsWith('/admin');
    const isDashboardPage = nextUrl.pathname.startsWith('/dashboard');

    if (isAuthPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
        return NextResponse.next();
    }

    if (!isLoggedIn && (isAdminPage || isDashboardPage)) {
        return NextResponse.redirect(new URL('/login', nextUrl));
    }

    if (isLoggedIn) {
        if (isAdminPage && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }

        if (isDashboardPage && !isApproved && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/pending', nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
