'use server';

import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateStudyNotes(videoUrl: string) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return { error: 'Gemini API Key is missing. Please configure it in your environment variables.' };
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // 1. Extract Video ID
        const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        const videoId = videoIdMatch?.[1];

        if (!videoId) {
            return { error: 'Invalid YouTube URL. Please use a standard video link.' };
        }

        // 2. Fetch Transcript
        let transcriptText = '';
        try {
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

            if (!transcriptItems || transcriptItems.length === 0) {
                return { error: 'No captions found for this video. AI currently only works on videos with captions.' };
            }

            transcriptText = transcriptItems.map(item => item.text).join(' ');
        } catch (transcriptError) {
            console.error('Transcript Error:', transcriptError);
            return { error: 'Failed to fetch video captions. The video might not have captions enabled or is restricted.' };
        }

        // 3. Generate Summary with Gemini
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `
            You are an expert study assistant. I will provide you with a transcript of a video.
            Your task is to create high-quality, structured study notes.
            
            FORMAT REQUIREMENTS:
            - Use clear Markdown headings (#, ##, ###).
            - Use bullet points for key concepts.
            - Highlight important terms in **bold**.
            - Create a "Summary" section at the top.
            - Create a "Quiz" section at the bottom with 3 review questions (and answers hidden in a details block if possible, or just listed).
            
            TRANSCRIPT:
            ${transcriptText.substring(0, 30000)} // Limit context to avoid token limits if video is huge
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const markdownNotes = response.text();

            return { notes: markdownNotes };
        } catch (aiError) {
            console.error('Gemini API Error:', aiError);
            return { error: 'Failed to generate summary with AI. Please try again later.' };
        }

    } catch (error) {
        console.error('General Error:', error);
        return { error: 'Something went wrong. Please try again.' };
    }
}
