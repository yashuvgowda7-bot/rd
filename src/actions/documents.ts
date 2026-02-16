'use server';

import { db } from '@/lib/db';
import { documents, documentChunks } from '@/lib/db/schema';
import { generateEmbedding } from '@/lib/embeddings';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { eq, sql, desc, asc } from 'drizzle-orm';
// @ts-ignore
import pdf from 'pdf-parse-fork';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function uploadDocument(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: 'Unauthorized' };

        const file = formData.get('file') as File;
        if (!file) return { error: 'No file provided' };

        if (file.type !== 'application/pdf') return { error: 'Only PDF files are supported' };

        console.log(`Starting upload for file: ${file.name}, size: ${file.size}`);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use the standard pdf-parse API
        let text = "";
        try {
            const result = await pdf(buffer);
            text = result.text;
        } catch (pdfError) {
            console.error('PDF Parsing Error:', pdfError);
            return { error: 'Failed to extract text from PDF (Standard API)' };
        }

        if (!text || text.length < 10) return { error: 'Document appears to be empty or not readable' };

        // 1. Save Document record
        const [doc] = await db.insert(documents).values({
            userId: session.user.id,
            title: file.name,
        }).returning();

        // 2. Chunk Text
        const chunkSize = 800; // Smaller chunks for better context window management
        const overlap = 150;
        const chunks: string[] = [];

        for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
            const chunk = text.slice(i, i + chunkSize).trim();
            if (chunk.length > 20) {
                chunks.push(chunk);
            }
        }

        console.log(`Successfully parsed PDF. Document ID: ${doc.id}. Preparing ${chunks.length} chunks.`);

        // 3. Generate Embeddings & Save Chunks (Sequential for stability)
        for (let i = 0; i < chunks.length; i++) {
            try {
                const embedding = await generateEmbedding(chunks[i]);
                await db.insert(documentChunks).values({
                    documentId: doc.id,
                    content: chunks[i],
                    embedding: embedding,
                });
            } catch (embedError) {
                console.error(`Chunk ${i} embedding error:`, embedError);
                // Continue with other chunks if one fails? Or fail whole upload?
                // Let's fail if it's the first one, otherwise continue
                if (i === 0) throw embedError;
            }
        }

        console.log(`Upload complete for document: ${doc.id}`);
        revalidatePath('/dashboard/documents');
        return { success: true, documentId: doc.id };

    } catch (error: any) {
        console.error('CRITICAL Upload Error:', error);
        return { error: error.message || 'Failed to process document' };
    }
}

export async function chatWithDocument(documentId: string, question: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: 'Unauthorized' };

        // 1. Embed Question
        const questionEmbedding = await generateEmbedding(question);

        // 2. Vector Search
        const similarChunks = await db.select({
            content: documentChunks.content,
        })
            .from(documentChunks)
            .where(eq(documentChunks.documentId, documentId))
            .orderBy(sql`${documentChunks.embedding} <=> ${JSON.stringify(questionEmbedding)}`)
            .limit(5);

        if (!similarChunks.length) {
            return { answer: "I couldn't find any relevant information in this document to answer your question." };
        }

        const context = similarChunks.map(c => c.content).join('\n---\n');

        // 3. LLM Generation
        const prompt = `
        You are a smart study assistant. Use the following context from a document to answer the user's question.
        Provide a detailed but concise answer. If the answer is not in the context, clearly state that you cannot find it in the provided document.
        
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

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`AI API Error: ${errBody}`);
        }

        const data = await response.json();
        return { answer: data.choices[0]?.message?.content || "No answer generated." };

    } catch (error: any) {
        console.error('Chat Error:', error);
        return { error: error.message || 'Failed to generate answer' };
    }
}

export async function getDocuments() {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        return await db.query.documents.findMany({
            where: eq(documents.userId, session.user.id),
            orderBy: [desc(documents.createdAt)],
        });
    } catch (error) {
        console.error('getDocuments error:', error);
        return [];
    }
}

export async function getDocument(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return null;

        return await db.query.documents.findFirst({
            where: eq(documents.id, id),
        });
    } catch (error) {
        console.error('getDocument error:', error);
        return null;
    }
}
