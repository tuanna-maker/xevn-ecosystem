import { spawn } from 'node:child_process';
import { existsSync, openSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const cwd = resolve(root, 'apps/api/xbos-api');
const main = resolve(cwd, 'dist/main.js');
const scope = resolve(cwd, 'dist/common/xbos-group-legal-scope.js');
if (!existsSync(main)) {
  console.error('missing', main);
  process.exit(2);
}
const hasFix = readFileSync(scope, 'utf8').includes('XBOS_GROUP_MEMBER_COMPANY_SLUGS');
console.log('start', { main, hasFix });
if (!hasFix) process.exit(3);

const log = resolve(root, 'docs/qa/evidence/_tmp-xbos-api-dest-reload-restart.log');
const out = openSync(log, 'w');
const child = spawn(process.execPath, [main], {
  cwd,
  env: { ...process.env, XBOS_BE_PORT: '28002', PORT: '28002' },
  detached: true,
  stdio: ['ignore', out, out],
});
child.unref();
console.log('pid', child.pid);

for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 500));
  try {
    const res = await fetch('http://127.0.0.1:28002/api/xbos', { signal: AbortSignal.timeout(2000) });
    if (res.status === 200) {
      console.log('health 200');
      process.exit(0);
    }
  } catch {
    /* wait */
  }
}
console.error('health timeout');
process.exit(4);
