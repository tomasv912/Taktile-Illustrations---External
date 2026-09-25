// Local preview: wraps the page fragment in the same kind of skeleton the Artifact publish adds.
// Serves index.html from this file's folder, whatever the working directory is.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const page = path.join(path.dirname(fileURLToPath(import.meta.url)), 'index.html');
const head = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>';
http.createServer((q, r) => {
  fs.readFile(page, 'utf8', (e, d) => {
    r.writeHead(e ? 500 : 200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    r.end(e ? String(e) : head + d + '</body></html>');
  });
}).listen(Number(process.env.PORT) || 5173);
