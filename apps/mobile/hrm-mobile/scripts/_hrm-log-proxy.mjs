/** One-shot HTTP log proxy for qa-device MOB-04 (host only, no seed). */
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const LOG = path.join(
  REPO,
  'docs',
  'qa',
  'evidence',
  'screenshots',
  'po-hrm-ui-brand-w4-mob-a-qa-01-r2-mob04-net',
  'hrm-proxy-access.log',
);
const LISTEN = Number(process.env.HRM_LOG_PROXY_PORT || 17801);
const TARGET_HOST = '127.0.0.1';
const TARGET_PORT = Number(process.env.HRM_BE_PORT || 28001);

fs.mkdirSync(path.dirname(LOG), { recursive: true });
fs.writeFileSync(LOG, `# HRM log proxy ${new Date().toISOString()}\n`, 'utf8');

function append(line) {
  fs.appendFileSync(LOG, line + '\n', 'utf8');
  process.stdout.write(line + '\n');
}

const server = http.createServer((req, res) => {
  const started = Date.now();
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    append(`${new Date().toISOString()} ${req.method} ${req.url} bytes=${body.length}`);
    const headers = { ...req.headers, host: `${TARGET_HOST}:${TARGET_PORT}` };
    const proxyReq = http.request(
      {
        hostname: TARGET_HOST,
        port: TARGET_PORT,
        path: req.url,
        method: req.method,
        headers,
      },
      (proxyRes) => {
        append(
          `  -> status=${proxyRes.statusCode} ms=${Date.now() - started} ${req.method} ${req.url}`,
        );
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );
    proxyReq.on('error', (e) => {
      append(`  -> proxy_error ${e.message}`);
      res.statusCode = 502;
      res.end('proxy error');
    });
    if (body.length) proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(LISTEN, '127.0.0.1', () => {
  append(`listening http://127.0.0.1:${LISTEN} -> ${TARGET_HOST}:${TARGET_PORT}`);
});
