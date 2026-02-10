'use server';

import { YoutubeTranscript } from 'youtube-transcript';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY; // Fallback

export async function generateStudyNotes(videoUrl: string) {
    try {
        if (!OPENROUTER_API_KEY) {
            return { error: 'Gemini/OpenRouter API Key is missing. Please configure it in your environment variables.' };
        }

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
            console.error('Standard Transcript Error:', transcriptError);
            console.log('Attempting fallback with youtubei.js...');

            try {
                // Fallback: Use youtubei.js to get caption URL and fetch manually
                const { Innertube, UniversalCache } = await import('youtubei.js');
                const yt = await Innertube.create({ cache: new UniversalCache(false) });
                const info = await yt.getInfo(videoId);

                if (!info.captions || !info.captions.caption_tracks || info.captions.caption_tracks.length === 0) {
                    throw new Error('No captions found in video metadata.');
                }

                // Prefer English
                const track = info.captions.caption_tracks.find((t: any) => t.language_code === 'en') || info.captions.caption_tracks[0];
                console.log('Fallback: Fetching captions from', track.base_url);

                const response = await yt.session.http.fetch(track.base_url);
                const transcriptXml = await response.text();

                // Parse XML
                const matches = transcriptXml.matchAll(/<text start="[\d.]+" dur="[\d.]+">([^<]+)<\/text>/g);
                let fullText = '';
                for (const match of matches) {
                    let text = match[1]
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'");
                    fullText += text + ' ';
                }

                if (!fullText) {
                    throw new Error('Parsed transcript is empty.');
                }

                transcriptText = fullText;
                console.log('Fallback success! Transcript length:', transcriptText.length);

            } catch (fallbackError) {
                console.error('Fallback Transcript Error:', fallbackError);
                return { error: 'Failed to fetch video captions. The video might not have captions enabled or is restricted.' };
            }
        }

        // 3. Generate Summary with OpenRouter
        try {
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

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000", // Optional: for OpenRouter rankings
                    "X-Title": "RBAC Dashboard Study Tool", // Optional
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-flash-001", // Using Gemini via OpenRouter
                    "messages": [
                        { "role": "user", "content": prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`OpenRouter API Error: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            const markdownNotes = data.choices[0]?.message?.content || "No content generated.";

            return { notes: markdownNotes };
        } catch (aiError) {
            console.error('AI API Error:', aiError);
            return { error: 'Failed to generate summary with AI. Please try again later.' };
        }

    } catch (error) {
        console.error('General Error:', error);
        return { error: 'Something went wrong. Please try again.' };
    }
}
