import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { config } from './config.js';
import { loadLibrary } from './storage.js';

const MIME_TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

export function createServer({ publicDir = 'public', dataFile = config.dataFile } = {}) {
  return createHttpServer(async (request, response) => {
    try {
      if (request.url === '/api/playlists') {
        const body = JSON.stringify(await loadLibrary(dataFile));
        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(body);
        return;
      }

      const requestedPath = request.url === '/' ? '/index.html' : new URL(request.url, 'http://localhost').pathname;
      const safePath = normalize(requestedPath).replace(/^([.][.][/\\])+/, '');
      const filePath = join(publicDir, safePath);
      await stat(filePath);
      response.writeHead(200, { 'Content-Type': MIME_TYPES[extname(filePath)] ?? 'application/octet-stream' });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().listen(config.dashboardPort, () => console.log(`Dashboard: http://localhost:${config.dashboardPort}`));
}
