/**
 * Chạy gradlew từ apps/mobile/hrm-mobile/android (đa nền tảng).
 * Dùng: node scripts/gradle.cjs assembleRelease --no-daemon
 *
 * Windows + đường dẫn Unicode:
 * - JVM không load được gradle-wrapper.jar từ classpath (GradleWrapperMain).
 * - Sau đó Node `require.resolve` trả path Unicode → Groovy không đọc được `expo/.../autolinking.gradle`.
 * Giải pháp: `subst <ổ>: <gốc monorepo>` rồi chạy gradlew từ `ổ:\apps\mobile\hrm-mobile\android` (toàn ASCII).
 */
const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const mobileRoot = path.resolve(path.join(__dirname, '..'));
const androidDir = path.join(mobileRoot, 'android');
/** Gốc repo xevn-ecosystem (…/apps/mobile/hrm-mobile → lên 3 cấp). */
const repoRoot = path.resolve(path.join(mobileRoot, '..', '..', '..'));
const isWin = process.platform === 'win32';
const args = process.argv.slice(2);

function pathHasNonAscii(p) {
  return /[^\u0000-\u007f]/.test(p);
}

/**
 * Gắn ổ đĩa trống (Z: → …) trỏ tới repoRoot. Trả về ví dụ `P:` (có dấu hai chấm).
 * @param {string} absRepoRoot
 * @returns {string}
 */
function substRepoDrive(absRepoRoot) {
  const letters = 'ZYXWVUTSRQPONMLKJIHGFEDCBA'.split('');
  const quoted = absRepoRoot.replace(/"/g, '""');
  for (const L of letters) {
    const drive = `${L}:`;
    try {
      execSync(`subst ${drive} "${quoted}"`, { shell: true, stdio: 'pipe' });
      return drive;
    } catch {
      // ổ đã dùng hoặc subst từ chối — thử chữ cái kế
    }
  }
  throw new Error(
    '[gradle] Không gán được subst (hết chữ cái ổ?). Đặt repo dưới đường dẫn ASCII hoặc giải phóng một ổ.',
  );
}

function substDelete(drive) {
  try {
    execSync(`subst ${drive} /d`, { shell: true, stdio: 'pipe' });
  } catch {
    /* ignore */
  }
}

/**
 * @returns {{ execCwd: string, substDrive: string | null }}
 */
function resolveExecCwd() {
  if (!isWin || !pathHasNonAscii(repoRoot)) {
    return { execCwd: androidDir, substDrive: null };
  }
  const drive = substRepoDrive(repoRoot);
  const relAndroid = path.relative(repoRoot, androidDir);
  const execCwd = path.resolve(`${drive}\\`, relAndroid);
  if (!fs.existsSync(path.join(execCwd, isWin ? 'gradlew.bat' : 'gradlew'))) {
    substDelete(drive);
    throw new Error(`[gradle] Sau subst, không thấy gradlew tại: ${execCwd}`);
  }
  console.error('[gradle] Đường dẫn Unicode → subst', drive, '→', repoRoot);
  console.error('[gradle] cwd Gradle:', execCwd);
  return { execCwd, substDrive: drive };
}

const { execCwd, substDrive } = resolveExecCwd();
const gradlew = path.join(execCwd, isWin ? 'gradlew.bat' : 'gradlew');

function runLinkPlugin(env) {
  const link = path.join(__dirname, 'link-rn-gradle-plugin.cjs');
  const lr = spawnSync(process.execPath, [link], {
    cwd: mobileRoot,
    env,
    stdio: 'inherit',
  });
  if (lr.status === null || lr.status !== 0) {
    process.exit(lr.status === null ? 1 : lr.status);
  }
}

let status = 1;
try {
  const env = { ...process.env };
  if (substDrive) {
    const substRootAbs = path.resolve(`${substDrive}\\`);
    env.GRADLE_REAL_REPO_ROOT = repoRoot;
    env.GRADLE_SUBST_REPO_ROOT = substRootAbs;
  }
  runLinkPlugin(env);
  const r = spawnSync(gradlew, args, {
    cwd: execCwd,
    stdio: 'inherit',
    shell: isWin,
    env,
  });
  status = r.status === null ? 1 : r.status;
} finally {
  if (substDrive) substDelete(substDrive);
}

process.exit(status);
