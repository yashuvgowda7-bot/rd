'use server';

import { db } from '@/lib/db';
import { documents, documentChunks } from '@/lib/db/schema';
import { generateEmbedding } from '@/lib/embeddings';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { eq, sql, desc, asc } from 'drizzle-orm';
import pdf from 'pdf-parse';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function uploadDocument(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: 'Unauthorized' };

        const file = formData.get('file') as File;
        if (!file) return { error: 'No file provided' };

        if (file.type !== 'application/pdf') return { error: 'Only PDF files are supported' };

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdf(buffer);
        const text = data.text;

        if (!text || text.length < 10) return { error: 'Could not extract text from PDF' };

        // 1. Save Document
        const [doc] = await db.insert(documents).values({
            userId: session.user.id,
            title: file.name,
        }).returning();

        // 2. Chunk Text (Simple implementation)
        const chunkSize = 1000;
        const overlap = 200;
        const chunks: string[] = [];

        for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
            chunks.push(text.slice(i, i + chunkSize));
        }

        console.log(`Generated ${chunks.length} chunks for document ${doc.id}`);

        // 3. Generate Embeddings & Save Chunks
        // Process in batches to avoid rate limits or memory issues
        for (const chunkContent of chunks) {
            const embedding = await generateEmbedding(chunkContent);
            await db.insert(documentChunks).values({
                documentId: doc.id,
                content: chunkContent,
                embedding: embedding,
            });
        }

        revalidatePath('/dashboard/documents');
        return { success: true, documentId: doc.id };

    } catch (error) {
        console.error('Upload Error:', error);
        return { error: 'Failed to process document' };
    }
}

export async function chatWithDocument(documentId: string, question: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: 'Unauthorized' };

        // 1. Embed Question
        const questionEmbedding = await generateEmbedding(question);

        // 2. Vector Search using Cosine Distance (<=>)
        // Note: vector extension must be enabled
        const similarChunks = await db.select({
            content: documentChunks.content,
            similarity: sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(questionEmbedding)})`
        })
            .from(documentChunks)
            .where(eq(documentChunks.documentId, documentId))
            .orderBy(sql`${documentChunks.embedding} <=> ${JSON.stringify(questionEmbedding)}`)
            .limit(5);

        const context = similarChunks.map(c => c.content).join('\n---\n');

        // 3. LLM Generation
        const prompt = `
        You are a helpful assistant. Use the following context to answer the user's question.
        If the answer is not in the context, say so.
        
        CONTEXT:
        ${context}
        
        QUESTION:
        ${question}
        `;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
                "X-Title": "RBAC Dashboard Document Chat",
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "user", "content": prompt }
                ]
            })
        });

        if (!response.ok) throw new Error('Failed to fetch from OpenRouter');

        const data = await response.json();
        return { answer: data.choices[0]?.message?.content || "No answer generated." };

    } catch (error) {
        console.error('Chat Error:', error);
        return { error: 'Failed to generate answer' };
    }
}

export async function getDocuments() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return db.query.documents.findMany({
        where: eq(documents.userId, session.user.id),
        orderBy: [desc(documents.createdAt)],
    });
}

export async function getDocument(id: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    return db.query.documents.findFirst({
        where: eq(documents.id, id),
    });
}
