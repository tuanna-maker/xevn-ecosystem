/**
 * Chọn cổng host trống cho stack deploy/xevn-ecosystem — dùng chọn bởi pick-xevn-host-ports.mjs và bootstrap/factory.
 */
import net from 'node:net';
import fs from 'node:fs';

/** [biến env, cổng bắt đầu dò, bước nhảy] */
export const PORT_ROLES = [
  ['PORTAL_FE_PORT', 28088, 1],
  ['HRM_FE_PORT', 28080, 1],
  ['XBOS_FE_PORT', 28073, 1],
  ['HRM_BE_PORT', 28001, 1],
  ['XBOS_BE_PORT', 28002, 1],
];

function tryListen(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    const done = (ok) => {
      s.removeAllListeners();
      try {
        s.close(() => resolve(ok));
      } catch {
        resolve(ok);
      }
    };
    s.once('error', () => done(false));
    s.listen(port, '0.0.0.0', () => done(true));
  });
}

async function pickPort(start, stride) {
  for (let i = 0; i < 80; i += 1) {
    const p = start + i * stride;
    if (p > 65534) break;
    if (await tryListen(p)) return p;
  }
  throw new Error(`Không tìm được cổng trống từ ${start}`);
}

export async function buildPortAssignmentBlock() {
  const lines = [];
  for (const [key, start, stride] of PORT_ROLES) {
    const p = await pickPort(start, stride);
    lines.push(`${key}=${p}`);
  }
  return `# --- xevn-host-ports (${new Date().toISOString()}) ---\n${lines.join('\n')}\n`;
}

export function writePortBlockToEnvFile(envPath, block) {
  const keys = PORT_ROLES.map((r) => r[0]);
  let raw = fs.readFileSync(envPath, 'utf8');
  raw = raw
    .split(/\r?\n/)
    .filter((line) => {
      const m = /^([A-Z0-9_]+)=/.exec(line.trim());
      if (!m) return true;
      return !keys.includes(m[1]);
    })
    .join('\n')
    .trimEnd();
  fs.writeFileSync(envPath, `${raw}\n\n${block}`, 'utf8');
}
