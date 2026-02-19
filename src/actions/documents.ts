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
        const workspaceId = formData.get('workspaceId') as string | null;
        if (!file) return { error: 'No file provided' };

        if (file.type !== 'application/pdf') return { error: 'Only PDF files are supported' };

        console.log(`Starting upload for file: ${file.name}, size: ${file.size}, workspace: ${workspaceId || 'none'}`);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use the standard pdf-parse-fork API with fallback for ESM/CJS interop
        let text = "";
        try {
            const pdfParser = typeof pdf === 'function' ? pdf : (pdf as any).default;
            if (typeof pdfParser !== 'function') {
                throw new Error("PDF parser is not a function. Check import configuration.");
            }
            const result = await pdfParser(buffer);
            text = result.text;
        } catch (pdfError) {
            console.error('PDF Parsing Error:', pdfError);
            return { error: 'Failed to extract text from PDF (Standard API)' };
        }

        if (!text || text.length < 10) return { error: 'Document appears to be empty or not readable' };

        // 1. Save Document record
        const [doc] = await db.insert(documents).values({
            userId: session.user.id,
            workspaceId: workspaceId || null,
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
                if (i === 0) throw embedError;
            }
        }

        console.log(`Upload complete for document: ${doc.id}`);
        if (workspaceId) {
            revalidatePath(`/dashboard/workspaces/${workspaceId}`);
        } else {
            revalidatePath('/dashboard/documents');
        }
        return { success: true, documentId: doc.id };

    } catch (error: any) {
        console.error('CRITICAL Upload Error:', error);
        return { error: error.message || 'Failed to process document' };
    }
}

async function performDeepSearch(query: string) {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    if (!FIRECRAWL_API_KEY) {
        console.warn("Firecrawl API key not found. Skipping deep search.");
        return [];
    }

    try {
        const response = await fetch("https://api.firecrawl.dev/v1/search", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: query,
                limit: 3,
                lang: "en",
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Firecrawl Error:", err);
            return [];
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Firecrawl Fetch Error:", error);
        return [];
    }
}

async function generateLLMResponse(prompt: string) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    // Try OpenRouter first
    try {
        console.log("Attempting OpenRouter LLM generation...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
                "X-Title": "Multi-Doc Workspace Chat",
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [{ "role": "user", "content": prompt }]
            })
        });

        if (response.status === 402) {
            console.warn("OpenRouter credits depleted (402). Falling back to Groq...");
            return await fetchGroqResponse(prompt);
        }

        if (!response.ok) {
            const errBody = await response.text();
            console.error(`OpenRouter failed (${response.status}): ${errBody}. Trying Groq fallback...`);
            return await fetchGroqResponse(prompt);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "No answer generated.";

    } catch (error: any) {
        console.error("OpenRouter primary flow failed:", error.message);
        return await fetchGroqResponse(prompt);
    }
}

async function fetchGroqResponse(prompt: string) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        throw new Error("No secondary LLM provider (Groq) configured and OpenRouter failed.");
    }

    console.log("Using Groq fallback (llama-3.3-70b-versatile)...");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "model": "llama-3.3-70b-versatile",
            "messages": [{ "role": "user", "content": prompt }]
        })
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Groq API Error: ${errBody}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No answer generated.";
}

export async function chatWithWorkspace(workspaceId: string, question: string, deepSearch: boolean = false) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: 'Unauthorized' };

        // 1. Embed Question
        const questionEmbedding = await generateEmbedding(question);

        // 2. Vector Search across all documents in workspace
        const similarChunks = await db.select({
            content: documentChunks.content,
            docTitle: documents.title,
            docId: documents.id,
        })
            .from(documentChunks)
            .innerJoin(documents, eq(documentChunks.documentId, documents.id))
            .where(eq(documents.workspaceId, workspaceId))
            .orderBy(sql`${documentChunks.embedding} <=> ${JSON.stringify(questionEmbedding)}`)
            .limit(8);

        let context = similarChunks.map(c => `[Source: ${c.docTitle}] ${c.content}`).join('\n---\n');

        // 3. Optional Deep Search
        let webContent = "";
        if (deepSearch) {
            const searchResults = await performDeepSearch(question);
            webContent = searchResults.map((r: any) => `[Web Source: ${r.url}] ${r.title}\n${r.markdown || r.description || ''}`).join('\n---\n');
            if (webContent) {
                context += `\n\nWEB SEARCH RESULTS:\n${webContent}`;
            }
        }

        if (!similarChunks.length && !webContent) {
            return { answer: "I couldn't find any relevant information in the workspace or the web to answer your question." };
        }

        // 4. LLM Generation
        const prompt = `
        You are a smart study assistant. Use the following context from multiple documents and/or web results to answer the user's question.
        Provide a detailed but concise answer. 
        IMPORTANT: You MUST cite your sources. When you use information from a document, mention its title (e.g., "[Source: Document Name]"). If you use information from a web search, mention the URL.
        
        CONTEXT:
        ${context}
        
        QUESTION:
        ${question}
        `;

        const answer = await generateLLMResponse(prompt);
        return { answer };

    } catch (error: any) {
        console.error('Workspace Chat Error:', error);
        return { error: error.message || 'Failed to generate answer' };
    }
}

export async function chatWithDocument(documentId: string, question: string) {
    // Legacy support or single-doc chat (could be refactored to use a temporary workspace or similar)
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: 'Unauthorized' };

        const questionEmbedding = await generateEmbedding(question);

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

        const prompt = `
        You are a smart study assistant. Use the following context from a document to answer the user's question.
        Provide a detailed but concise answer. If the answer is not in the context, clearly state that you cannot find it in the provided document.
        
        CONTEXT:
        ${context}
        
        QUESTION:
        ${question}
        `;

        const answer = await generateLLMResponse(prompt);
        return { answer };

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
