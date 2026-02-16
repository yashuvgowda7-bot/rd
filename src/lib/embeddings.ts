const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

async function fetchHuggingFaceEmbedding(text: string): Promise<number[]> {
    try {
        const HF_MODEL = "sentence-transformers/all-mpnet-base-v2"; // 768 dimensions
        const url = "https://router.huggingface.co/v1/embeddings";

        console.log(`Falling back to Hugging Face Router (${HF_MODEL})...`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: HF_MODEL,
                input: text,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hugging Face Router API Error: ${errorText}`);
        }

        const json = await response.json();
        const embedding = json.data?.[0]?.embedding;

        if (!Array.isArray(embedding)) {
            console.error("Unexpected HF Router Response:", JSON.stringify(json));
            throw new Error("Hugging Face Router did not return a valid vector array.");
        }

        return embedding;
    } catch (error: any) {
        console.error("Hugging Face Router Error:", error.message);
        throw error;
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        console.log(`Attempting OpenRouter embedding (length: ${text.length})...`);

        const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-embedding-001",
                input: text,
            }),
        });

        // 402 is Insufficient Credits
        if (response.status === 402) {
            console.warn("OpenRouter credits depleted (402). Using Hugging Face fallback...");
            return await fetchHuggingFaceEmbedding(text);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.warn(`OpenRouter primary failed (${response.status}), trying fallback...`);
            return await fetchHuggingFaceEmbedding(text);
        }

        const data = await response.json();
        const embedding = data.data?.[0]?.embedding;

        if (!embedding) {
            console.warn("No embedding in OpenRouter response, trying fallback...");
            return await fetchHuggingFaceEmbedding(text);
        }

        console.log(`Successfully generated embedding via OpenRouter. Dimensions: ${embedding.length}`);
        return embedding;

    } catch (error: any) {
        console.error("Embedding primary flow failed:", error.message);
        try {
            return await fetchHuggingFaceEmbedding(text);
        } catch (fallbackError: any) {
            console.error("All embedding providers failed.");
            throw new Error(`Embedding generation failed: ${fallbackError.message}`);
        }
    }
}
