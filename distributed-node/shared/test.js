import http from 'http'
import fs from 'fs'
import zlib from 'zlib'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

http.createServer((request, response) => {
    const raw = fs.createReadStream(__dirname + '/index.html');
    const acceptEncoding = request.headers['accept-encoding'] || '';
    response.setHeader('Content-Type', 'text/plain');
    console.log(acceptEncoding);
    if (acceptEncoding.includes('gzip')) {
        console.log('encoding with gzip');
        response.setHeader('Content-Encoding', 'gzip');
        raw.pipe(zlib.createGzip()).pipe(response);
    } else {
        console.log('no encoding');
        raw.pipe(response);
    }
}).listen(process.env.PORT || 3000, (err) => {
    console.log(`The server is running on http://localhost:3000`)
});
