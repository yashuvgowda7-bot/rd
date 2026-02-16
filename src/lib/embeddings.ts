import { pipeline } from '@xenova/transformers';

class EmbeddingService {
    private static instance: any = null;

    static async getInstance() {
        if (!this.instance) {
            this.instance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
        return this.instance;
    }

    static async generateEmbedding(text: string): Promise<number[]> {
        const extractor = await this.getInstance();
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
}

export async function generateEmbedding(text: string) {
    return EmbeddingService.generateEmbedding(text);
}
