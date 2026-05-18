const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, 'gradle.cjs');
const content = `/**
 * Chạy gradlew từ apps/mobile/hrm-mobile/android (đa nền tảng).
 * Dùng: node scripts/gradle.cjs assembleRelease --no-daemon
 */
const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const mobileRoot = path.resolve(path.join(__dirname, '..'));
const androidDir = path.join(mobileRoot, 'android');
const repoRoot = path.resolve(path.join(mobileRoot, '..', '..', '..'));
const isWin = process.platform === 'win32';
const args = process.argv.slice(2);

function pathHasNonAscii(p) {
  return /[^\\u0000-\\u007f]/.test(p);
}

function substRepoDrive(absRepoRoot) {
  const letters = 'ZYXWVUTSRQPONMLKJIHGFEDCBA'.split('');
  const quoted = absRepoRoot.replace(/"/g, '""');
  for (const L of letters) {
    const drive = \`\${L}:\`;
    try {
      execSync(\`subst \${drive} "\${quoted}"\`, { shell: true, stdio: 'pipe' });
      return drive;
    } catch {
      /* next letter */
    }
  }
  throw new Error('[gradle] Không gán được subst.');
}

function substDelete(drive) {
  try {
    execSync(\`subst \${drive} /d\`, { shell: true, stdio: 'pipe' });
  } catch {
    /* ignore */
  }
}

function resolveExecCwd() {
  if (!isWin || !pathHasNonAscii(repoRoot)) {
    return { execCwd: androidDir, substDrive: null };
  }
  const drive = substRepoDrive(repoRoot);
  const relAndroid = path.relative(repoRoot, androidDir);
  const execCwd = path.resolve(\`\${drive}\\\\\`, relAndroid);
  if (!fs.existsSync(path.join(execCwd, isWin ? 'gradlew.bat' : 'gradlew'))) {
    substDelete(drive);
    throw new Error(\`[gradle] Không thấy gradlew tại: \${execCwd}\`);
  }
  console.error('[gradle] Unicode path → subst', drive, '→', repoRoot);
  console.error('[gradle] cwd Gradle:', execCwd);
  return { execCwd, substDrive: drive };
}

function resolveFromMobile(specifier, pathsExtra = []) {
  const rnPkg = require.resolve('react-native/package.json', { paths: [mobileRoot, repoRoot] });
  const rnDir = path.dirname(rnPkg);
  return require.resolve(specifier, { paths: [rnDir, mobileRoot, repoRoot, ...pathsExtra] });
}

/** @param {string} absPath */
function toSubstPath(absPath) {
  if (!substDrive) return absPath;
  const substRoot = path.resolve(\`\${substDrive}\\\\\`);
  const rel = path.relative(repoRoot, absPath);
  if (rel.startsWith('..')) return absPath;
  return path.join(substRoot, rel);
}

function applyGradlePathEnv(env) {
  const expoPkg = resolveFromMobile('expo/package.json');
  const rnPkg = require.resolve('react-native/package.json', { paths: [mobileRoot, repoRoot] });
  const rnGradle = resolveFromMobile('@react-native/gradle-plugin/package.json');
  const cliAndroid = resolveFromMobile('@react-native-community/cli-platform-android/package.json');
  const expoAutolinking = resolveFromMobile('expo-modules-autolinking/package.json');
  const expoCore = resolveFromMobile('expo-modules-core/package.json');
  const rnDir = path.dirname(rnPkg);
  const jscPkg = require.resolve('jsc-android/package.json', { paths: [rnDir, mobileRoot, repoRoot] });
  const cliBin = require.resolve('@react-native-community/cli/build/bin.js', {
    paths: [mobileRoot, repoRoot, rnDir],
  });
  const expoCli = require.resolve('@expo/cli', { paths: [path.dirname(expoPkg), mobileRoot, repoRoot] });
  const codegenPkg = require.resolve('@react-native/codegen/package.json', {
    paths: [rnDir, mobileRoot, repoRoot],
  });

  env.GRADLE_RN_PLUGIN_ROOT = toSubstPath(path.dirname(rnGradle));
  env.GRADLE_PATH_EXPO_PKG = toSubstPath(expoPkg);
  env.GRADLE_PATH_RN_PKG = toSubstPath(rnPkg);
  env.GRADLE_PATH_RN_PKG_METRO = toSubstPath(rnPkg);
  env.GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG = toSubstPath(expoAutolinking);
  env.GRADLE_PATH_CLI_ANDROID_PKG = toSubstPath(cliAndroid);
  env.GRADLE_PATH_EXPO_MODULES_CORE_DIR = toSubstPath(path.join(path.dirname(expoCore), 'android'));
  env.GRADLE_PATH_RN_DIR = toSubstPath(rnDir);
  env.GRADLE_PATH_JSC_DIST = toSubstPath(path.join(path.dirname(jscPkg), 'dist'));
  env.GRADLE_RN_CLI_BIN = toSubstPath(cliBin);
  env.GRADLE_PATH_EXPO_CLI = toSubstPath(expoCli);
  env.GRADLE_PATH_CODEGEN_DIR = toSubstPath(codegenPkg);
  env.GRADLE_MOBILE_ROOT = toSubstPath(mobileRoot);
  env.GRADLE_PATH_APP_ENTRY = toSubstPath(path.join(mobileRoot, 'index.ts'));

  if (substDrive) {
    const substRootAbs = path.resolve(\`\${substDrive}\\\\\`);
    env.GRADLE_REAL_REPO_ROOT = repoRoot;
    env.GRADLE_SUBST_REPO_ROOT = substRootAbs;
    env.GRADLE_RN_PLUGIN_REL = path
      .relative(execCwd, env.GRADLE_RN_PLUGIN_ROOT)
      .split(path.sep)
      .join('/');
    const pack = toSubstPath(mobileRoot);
    env.REACT_NATIVE_PACKAGER_ROOT = pack;
    env.PROJECT_ROOT = pack;
    env.EXPO_PROJECT_ROOT = pack;
    env.NODE_PATH = [path.join(substRootAbs, 'node_modules'), path.join(pack, 'node_modules')].join(path.delimiter);
  }
}

function runLinkPlugin(env) {
  const link = path.join(__dirname, 'link-rn-gradle-plugin.cjs');
  const lr = spawnSync(process.execPath, [link], { cwd: mobileRoot, env, stdio: 'inherit' });
  if (lr.status === null || lr.status !== 0) {
    process.exit(lr.status === null ? 1 : lr.status);
  }
}

const { execCwd, substDrive } = resolveExecCwd();
const gradlew = path.join(execCwd, isWin ? 'gradlew.bat' : 'gradlew');

let status = 1;
try {
  const env = { ...process.env };
  applyGradlePathEnv(env);
  runLinkPlugin(env);
  const r = spawnSync(gradlew, args, { cwd: execCwd, stdio: 'inherit', shell: isWin, env });
  status = r.status === null ? 1 : r.status;
} finally {
  if (substDrive) substDelete(substDrive);
}

process.exit(status);
`;
fs.writeFileSync(out, content);
console.log('wrote gradle.cjs', fs.statSync(out).size);
