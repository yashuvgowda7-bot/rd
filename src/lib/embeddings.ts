const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/text-embedding-004",
                input: text,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter Error: ${errorText}`);
        }

        const data = await response.json();
        const embedding = data.data[0].embedding;
        
        if (!embedding) {
            throw new Error("No embedding found in response");
        }

        return embedding;
    } catch (error) {
        console.error("Embedding generation error:", error);
        throw new Error("Failed to generate embedding");
    }
}
