import { Innertube, UniversalCache } from 'youtubei.js';

const videoId = 'O9pD6LTF4Bk';

async function verify() {
    console.log(`Verifying fallback for ${videoId}...`);
    try {
        const yt = await Innertube.create({ cache: new UniversalCache(false) });
        const info = await yt.getInfo(videoId);

        if (!info.captions || !info.captions.caption_tracks || info.captions.caption_tracks.length === 0) {
            console.log('No captions found.');
            return;
        }

        const track = info.captions.caption_tracks.find((t: any) => t.language_code === 'en') || info.captions.caption_tracks[0];
        console.log('Fetching from:', track.base_url);

        const response = await yt.session.http.fetch(track.base_url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.youtube.com/',
                'Origin': 'https://www.youtube.com'
            }
        });
        console.log('Response Status:', response.status);
        const transcriptXml = await response.text();

        console.log('Transcript length:', transcriptXml.length);
        if (transcriptXml.length > 0) {
            console.log('Preview:', transcriptXml.substring(0, 500));
        } else {
            console.log('Transcript is empty.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

verify();
