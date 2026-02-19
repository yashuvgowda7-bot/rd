import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hash } from 'bcrypt-ts';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        // First user is admin and approved
        const allUsers = await db.query.users.findMany();
        console.log(`Current user count: ${allUsers.length}`);

        const role = allUsers.length === 0 ? 'admin' : 'user';
        const isApproved = allUsers.length === 0;

        console.log(`Assigning role: ${role}, approved: ${isApproved} to user: ${email}`);

        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            role: role as "admin" | "user",
            isApproved,
        });

        console.log('User inserted successfully');
        return NextResponse.json({ message: 'User created' }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
