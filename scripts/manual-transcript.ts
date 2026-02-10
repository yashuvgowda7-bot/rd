
const videoId = 'O9pD6LTF4Bk';

async function getTranscript(videoId: string) {
    console.log(`Fetching transcript for ${videoId}...`);
    try {
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
        const html = await response.text();

        const captionTracksMatch = html.match(/"captionTracks":(\[.*?\])/);
        if (!captionTracksMatch) {
            console.log('No captionTracks found in HTML');
            return null;
        }

        const captionTracks = JSON.parse(captionTracksMatch[1]);
        console.log('Found caption tracks:', captionTracks.length);

        // Find English track or fallback to first
        const track = captionTracks.find((t: any) => t.languageCode === 'en') || captionTracks[0];
        console.log('Selected track:', track.name.simpleText, track.languageCode);

        const fetchUrl = track.baseUrl + '&fmt=json3';
        console.log('Fetching from URL:', fetchUrl);
        const { execSync } = require('child_process');
        console.log('Running curl...');
        try {
            execSync(`curl -v "${fetchUrl}"`, { stdio: 'inherit' });
        } catch (e) {
            console.log('Curl failed');
        }

        const transcriptResponse = await fetch(fetchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        console.log('Status:', transcriptResponse.status, transcriptResponse.statusText);
        const transcriptXml = await transcriptResponse.text();
        console.log('Body length:', transcriptXml.length);
        console.log('Body (stringified):', JSON.stringify(transcriptXml.substring(0, 500)));

        // Simple XML parsing to extracting text
        // Format: <text start="0.1" dur="2.3">Hello world</text>
        const matches = transcriptXml.matchAll(/<text start="[\d.]+" dur="[\d.]+">([^<]+)<\/text>/g);

        let fullText = '';
        for (const match of matches) {
            // Decode HTML entities (basic)
            let text = match[1]
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
            fullText += text + ' ';
        }

        console.log('Transcript extracted!');
        console.log('Length:', fullText.length);
        console.log('Preview:', fullText.substring(0, 100));
        return fullText;

    } catch (error) {
        console.error('Manual fetch failed:', error);
        return null;
    }
}

getTranscript(videoId);
