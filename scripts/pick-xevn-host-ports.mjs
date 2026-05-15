#!/usr/bin/env node
/**
 * Tìm bộ cổng host trống cho stack deploy/xevn-ecosystem.
 *
 *   pnpm run deploy:pick-ports
 *   node ./scripts/pick-xevn-host-ports.mjs --write
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPortAssignmentBlock, writePortBlockToEnvFile } from './xevn-host-ports-lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const envPath = path.join(repoRoot, 'deploy', 'xevn-ecosystem', '.env');

async function main() {
  const block = await buildPortAssignmentBlock();
  console.log(block);
  if (process.argv.includes('--write')) {
    if (!fs.existsSync(envPath)) {
      console.error(`Thiếu ${envPath}. Chạy pnpm run deploy:xevn-ecosystem:bootstrap hoặc copy .env.example.`);
      process.exit(1);
    }
    writePortBlockToEnvFile(envPath, block);
    console.log(`Đã ghi ${envPath}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
