'use server';

import { db } from '@/lib/db';
import { workspaces, documents } from '@/lib/db/schema';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';

export async function createWorkspace(name: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: 'Unauthorized' };

        const [workspace] = await db.insert(workspaces).values({
            userId: session.user.id,
            name,
        }).returning();

        revalidatePath('/dashboard');
        return { success: true, workspaceId: workspace.id };
    } catch (error: any) {
        console.error('createWorkspace error:', error);
        return { error: error.message || 'Failed to create workspace' };
    }
}

export async function getWorkspaces() {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        return await db.query.workspaces.findMany({
            where: eq(workspaces.userId, session.user.id),
            orderBy: [desc(workspaces.createdAt)],
        });
    } catch (error) {
        console.error('getWorkspaces error:', error);
        return [];
    }
}

export async function getWorkspace(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return null;

        return await db.query.workspaces.findFirst({
            where: eq(workspaces.id, id),
        });
    } catch (error) {
        console.error('getWorkspace error:', error);
        return null;
    }
}

export async function deleteWorkspace(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: 'Unauthorized' };

        await db.delete(workspaces).where(eq(workspaces.id, id));

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('deleteWorkspace error:', error);
        return { error: error.message || 'Failed to delete workspace' };
    }
}

export async function getWorkspaceDocuments(workspaceId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        return await db.query.documents.findMany({
            where: eq(documents.workspaceId, workspaceId),
            orderBy: [desc(documents.createdAt)],
        });
    } catch (error) {
        console.error('getWorkspaceDocuments error:', error);
        return [];
    }
}
