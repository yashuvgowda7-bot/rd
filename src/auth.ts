import NextAuth, { type DefaultSession } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
    // @ts-ignore
    adapter: DrizzleAdapter(db),
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log(`Auth attempt for: ${credentials?.email}`);
                if (!credentials?.email || !credentials?.password) return null;

                const user = await db.query.users.findFirst({
                    where: eq(users.email, credentials.email as string),
                });

                if (!user || !user.password) {
                    console.log('User not found or no password');
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    console.log('Invalid password');
                    return null;
                }

                console.log(`User found: ${user.email}, role: ${user.role}`);
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isApproved: user.isApproved,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
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
    pages: {
        signIn: '/login',
    },
});

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: string;
            isApproved: boolean;
        } & DefaultSession['user'];
    }

    interface User {
        role?: string;
        isApproved?: boolean;
    }
}
