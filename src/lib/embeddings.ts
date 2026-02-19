const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const HF_API_KEY = process.env.HF_API_KEY || "";

async function fetchHuggingFaceEmbedding(text: string): Promise<number[]> {
    try {
        // Switching to BGE-base which is 768 dims and more stable for feature extraction
        const HF_BASE_MODEL = "BAAI/bge-base-en-v1.5";
        const HF_ROUTER_MODEL = `hf-inference/${HF_BASE_MODEL}`;

        // 1. Try the OpenAI-compatible router endpoint
        const url = `https://router.huggingface.co/v1/embeddings`;

        console.log(`Falling back to Hugging Face Router API (${HF_ROUTER_MODEL})...`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(HF_API_KEY ? { "Authorization": `Bearer ${HF_API_KEY}` } : {}),
            },
            body: JSON.stringify({
                model: HF_ROUTER_MODEL,
                input: text,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HF Router Error (${response.status}): ${errorText}. Trying raw inference endpoint...`);

            // 2. Fallback: Raw Inference API on the router
            const directUrl = `https://router.huggingface.co/hf-inference/models/${HF_BASE_MODEL}`;
            const directResponse = await fetch(directUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(HF_API_KEY ? { "Authorization": `Bearer ${HF_API_KEY}` } : {}),
                    "x-use-cache": "true"
                },
                body: JSON.stringify({ inputs: text }),
            });

            if (!directResponse.ok) {
                const directErrorText = await directResponse.text();
                throw new Error(`Hugging Face Direct API Error: ${directErrorText}`);
            }

            const result = await directResponse.json();

            // Handle different possible response shapes from HF Inference API (raw)
            if (Array.isArray(result)) {
                // If it's [ [...pooler_output...] ]
                if (Array.isArray(result[0]) && typeof result[0][0] === 'number') {
                    return result[0];
                }
                // If it's [0.1, 0.2, ...]
                if (typeof result[0] === 'number') {
                    return result as number[];
                }
            }

            throw new Error(`Hugging Face direct API returned unexpected format: ${JSON.stringify(result).slice(0, 100)}`);
        }

        const json = await response.json();
        const embedding = json.data?.[0]?.embedding;

        if (!Array.isArray(embedding)) {
            console.error("Unexpected HF Response Format:", JSON.stringify(json).slice(0, 200));
            throw new Error("Hugging Face did not return a valid vector array.");
        }

        return embedding;
    } catch (error: any) {
        console.error("Hugging Face Flow Error:", error.message);
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
