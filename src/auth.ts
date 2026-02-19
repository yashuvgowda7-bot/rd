import NextAuth, { type DefaultSession } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcrypt-ts';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db),
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const start = performance.now();

                const user = await db.query.users.findFirst({
                    where: eq(users.email, credentials.email as string),
                });

                const dbLookupTime = performance.now() - start;
                console.log(`[AUTH] DB Lookup took: ${dbLookupTime.toFixed(2)}ms`);

                if (!user || !user.password) return null;

                const compareStart = performance.now();
                const isPasswordValid = await compare(
                    credentials.password as string,
                    user.password
                );
                const compareTime = performance.now() - compareStart;
                console.log(`[AUTH] Password comparison took: ${compareTime.toFixed(2)}ms`);

                if (!isPasswordValid) return null;

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
});
