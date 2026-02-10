import type { NextAuthConfig } from 'next-auth';

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
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
                return true;
            }

            if (!isLoggedIn && (isAdminPage || isDashboardPage)) {
                return false; // Redirects to login
            }

            if (isLoggedIn) {
                if (isAdminPage && userRole !== 'admin') {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }

                if (isDashboardPage && !isApproved && userRole !== 'admin') {
                    return Response.redirect(new URL('/pending', nextUrl));
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
    // Fallback for AUTH_SECRET in case it's not set but NEXTAUTH_SECRET is
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
