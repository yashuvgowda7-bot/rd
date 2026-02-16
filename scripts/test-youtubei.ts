import { Innertube, UniversalCache } from 'youtubei.js';

const videoId = 'O9pD6LTF4Bk';

async function test() {
    console.log('Initializing Innertube...');
    const yt = await Innertube.create({ cache: new UniversalCache(false) });

    console.log(`Fetching info for ${videoId}...`);
    try {
        const info = await yt.getInfo(videoId);
        console.log('Video Title:', info.basic_info.title);

        if (info.captions && info.captions.caption_tracks) {
            console.log('Caption tracks found:', info.captions.caption_tracks.length);
            const track = info.captions.caption_tracks[0];
            console.log('First track URL:', track.base_url);

            console.log('Fetching transcript from URL using Internal Fetch...');
            const response = await yt.session.http.fetch(track.base_url);
            const text = await response.text();
            console.log('Transcript length:', text.length);
            console.log('Preview:', text.substring(0, 100));
        } else {
            console.log('No captions in info object.');
        }

        console.log('Fetching transcript...');
        const transcriptData = await info.getTranscript();

        if (transcriptData && transcriptData.transcript) {
            const segments = transcriptData.transcript?.content?.body?.initial_segments;
            const transcriptText = segments?.map((s: any) => s.snippet.text).join(' ') || '';
            console.log('Transcript found! Segments:', segments?.length || 0);

            console.log('Preview:', transcriptText.substring(0, 100));
        } else {
            console.log('No transcript data found.');
        }

    } catch (error) {
        console.error('Youtubei Error:', error);
    }
}

test();
