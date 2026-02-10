import NextAuth, { type DefaultSession } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db),
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            async authorize(credentials) {
                try {
                    console.log('[AUTH] Starting authorization for:', credentials?.email);
                    if (!credentials?.email || !credentials?.password) {
                        console.log('[AUTH] Missing credentials');
                        return null;
                    }

                    console.log('[AUTH] Querying database...');
                    const user = await db.query.users.findFirst({
                        where: eq(users.email, credentials.email as string),
                    });
                    console.log('[AUTH] Database query result:', user ? 'User found' : 'User not found');

                    if (!user || !user.password) return null;

                    console.log('[AUTH] Verifying password...');
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );
                    console.log('[AUTH] Password valid:', isPasswordValid);

                    if (!isPasswordValid) return null;

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        isApproved: user.isApproved,
                    };
                } catch (error) {
                    console.error('[AUTH] Authorization error:', error);
                    return null;
                }
            },
        }),
    ],
});
