import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = auth?.user?.role;
            const isApproved = auth?.user?.isApproved;

            const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/signup';
            const isAdminPage = nextUrl.pathname.startsWith('/admin');
            const isDashboardPage = nextUrl.pathname.startsWith('/dashboard');

            if (isAuthPage) {
                if (isLoggedIn) {
                    return NextResponse.redirect(new URL('/dashboard', nextUrl));
                }
                return true;
            }

            if (!isLoggedIn && (isAdminPage || isDashboardPage)) {
                return false; // Redirects to login
            }

            if (isLoggedIn) {
                if (isAdminPage && userRole !== 'admin') {
                    return NextResponse.redirect(new URL('/dashboard', nextUrl));
                }

                if (isDashboardPage && !isApproved && userRole !== 'admin') {
                    return NextResponse.redirect(new URL('/pending', nextUrl));
                }
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.isApproved = user.isApproved;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role as string;
                session.user.isApproved = token.isApproved as boolean;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
