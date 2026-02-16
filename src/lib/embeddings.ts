const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        console.log(`Generating embedding for text (length: ${text.length})...`);

        const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-embedding-001", // Using the more standard identifier
                input: text,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenRouter Embedding API Error (Status ${response.status}):`, errorText);
            throw new Error(`OpenRouter Error: ${errorText}`);
        }

        const data = await response.json();

        if (!data.data || !data.data[0] || !data.data[0].embedding) {
            console.error("Unexpected OpenRouter Response Structure:", JSON.stringify(data));
            throw new Error("No embedding found in response");
        }

        const embedding = data.data[0].embedding;
        console.log(`Successfully generated embedding. Dimensions: ${embedding.length}`);

        return embedding;
    } catch (error: any) {
        console.error("Embedding generation error:", error);
        throw new Error(`Failed to generate embedding: ${error.message || 'Unknown error'}`);
    }
}
