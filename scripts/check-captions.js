const https = require('https');

const videoId = 'O9pD6LTF4Bk';
const url = `https://www.youtube.com/watch?v=${videoId}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (data.includes('captionTracks')) {
            console.log('FOUND: captionTracks exists in HTML');
            const match = data.match(/"captionTracks":(\[.*?\])/);
            if (match) {
                console.log('Captions JSON:', match[1].substring(0, 500)); // Print first 500 chars
            }
        } else {
            console.log('NOT FOUND: captionTracks not found in HTML');
        }
    });
}).on('error', (e) => {
    console.error(e);
});
