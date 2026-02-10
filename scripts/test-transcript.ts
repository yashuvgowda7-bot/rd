import { YoutubeTranscript } from 'youtube-transcript';

const videoId = 'O9pD6LTF4Bk';

async function test() {
    console.log(`Testing transcript fetch for video ID: ${videoId}`);
    try {
        console.log('Attempt 1: Default');
        const t1 = await YoutubeTranscript.fetchTranscript(videoId);
        console.log('Default result length:', t1.length);

        console.log('Attempt 2: lang "en"');
        const t2 = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
        console.log('Lang "en" result length:', t2.length);
    } catch (error) {
        console.error('FAILED:');
        console.error(error);
    }
}

test();
