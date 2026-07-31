/**
 * Chạy gradlew từ apps/mobile/hrm-mobile/android.
 * Windows + OneDrive/Unicode: dùng junction C:\xevn-ecosystem + map path trong settings.gradle.
 */
const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const JUNCTION_REPO_ROOT = 'C:\\xevn-ecosystem';
const JUNCTION_MOBILE = path.join(JUNCTION_REPO_ROOT, 'apps', 'mobile', 'hrm-mobile');
const useJunction =
  fs.existsSync(path.join(JUNCTION_MOBILE, 'package.json')) &&
  fs.existsSync(path.join(JUNCTION_REPO_ROOT, 'pnpm-workspace.yaml'));

const mobileRoot = useJunction ? JUNCTION_MOBILE : path.resolve(path.join(__dirname, '..'));
const androidDir = path.join(mobileRoot, 'android');
const repoRoot = useJunction ? JUNCTION_REPO_ROOT : path.resolve(path.join(mobileRoot, '..', '..', '..'));
const isWin = process.platform === 'win32';
const args = process.argv.slice(2);

function pathHasNonAscii(p) {
  return /[^\u0000-\u007f]/.test(p);
}

function substRepoDrive(absRepoRoot) {
  for (const L of 'ZYXWVUTSRQPONMLKJIHGFEDCBA') {
    const drive = `${L}:`;
    try {
      execSync(`subst ${drive} "${absRepoRoot.replace(/"/g, '""')}"`, { shell: true, stdio: 'pipe' });
      return drive;
    } catch {
      /* next */
    }
  }
  throw new Error('[gradle] Không gán được subst.');
}

function substDelete(drive) {
  try {
    execSync(`subst ${drive} /d`, { shell: true, stdio: 'pipe' });
  } catch {
    /* ignore */
  }
}

function resolveExecCwd() {
  const wantSubst =
    isWin && (pathHasNonAscii(repoRoot) || process.env.GRADLE_USE_SUBST === '1');
  if (!wantSubst) {
    return { execCwd: androidDir, substDrive: null };
  }
  const drive = substRepoDrive(repoRoot);
  const execCwd = path.resolve(`${drive}\\`, path.relative(repoRoot, androidDir));
  if (!fs.existsSync(path.join(execCwd, 'gradlew.bat'))) {
    substDelete(drive);
    throw new Error(`[gradle] Không thấy gradlew: ${execCwd}`);
  }
  console.error('[gradle] subst', drive, '→', repoRoot);
  return { execCwd, substDrive: drive };
}

function resolveFromMobile(specifier) {
  const rnPkg = require.resolve('react-native/package.json', { paths: [mobileRoot, repoRoot] });
  return require.resolve(specifier, { paths: [path.dirname(rnPkg), mobileRoot, repoRoot] });
}

function toJunctionPath(absPath) {
  if (!useJunction || !absPath) return absPath;
  const idx = absPath.toLowerCase().indexOf('xevn-ecosystem');
  if (idx < 0) return absPath;
  let rel = absPath.slice(idx + 'xevn-ecosystem'.length);
  if (rel.startsWith(path.sep)) rel = rel.slice(path.sep.length);
  return path.join(JUNCTION_REPO_ROOT, rel);
}

function toSubstPath(absPath) {
  if (!substDrive) return absPath;
  const rel = path.relative(repoRoot, absPath);
  if (rel.startsWith('..')) return absPath;
  return path.join(path.resolve(`${substDrive}\\`), rel);
}

function gradlePath(absPath) {
  return toSubstPath(toJunctionPath(absPath));
}

function patchExpoAndroidBuildGradle(env) {
  const coreDir = env.GRADLE_PATH_EXPO_MODULES_CORE_DIR;
  if (!coreDir) return;
  for (const base of [mobileRoot, repoRoot]) {
    const target = path.join(base, 'node_modules', 'expo', 'android', 'build.gradle');
    if (!fs.existsSync(target)) continue;
    let src = fs.readFileSync(target, 'utf8');
    const needle =
      'def expoModulesCorePlugin = new File(project(":expo-modules-core").projectDir.absolutePath, "ExpoModulesCorePlugin.gradle")';
    const replacement = `def _coreDir = System.getenv("GRADLE_PATH_EXPO_MODULES_CORE_DIR")
def expoModulesCorePlugin = _coreDir != null
  ? new File(_coreDir, "ExpoModulesCorePlugin.gradle")
  : new File(project(":expo-modules-core").projectDir.absolutePath, "ExpoModulesCorePlugin.gradle")`;
    if (src.includes(needle) && !src.includes('GRADLE_PATH_EXPO_MODULES_CORE_DIR')) {
      src = src.replace(needle, replacement);
      fs.writeFileSync(target, src);
    }
  }
}

/**
 * CMake/ninja on Windows resolve junction → OneDrive Unicode realpath (>260) for
 * folly-flags.cmake. Prefer GRADLE_PATH_RN_DIR (short junction C:\\rn74).
 */
function patchExpoModulesCoreReactNativeDir() {
  const candidates = [
    path.join(repoRoot, 'node_modules', 'expo-modules-core', 'android', 'build.gradle'),
    path.join(mobileRoot, 'node_modules', 'expo-modules-core', 'android', 'build.gradle'),
  ];
  const needle = `def REACT_NATIVE_DIR = REACT_NATIVE_BUILD_FROM_SOURCE
  ? findProject(":packages:react-native:ReactAndroid").getProjectDir().parent
  : file(providers.exec {
      workingDir(rootDir)
      commandLine("node", "--print", "require.resolve('react-native/package.json')")
    }.standardOutput.asText.get().trim()).parent`;
  const replacement = `def _rnDirEnv = System.getenv("GRADLE_PATH_RN_DIR")
def REACT_NATIVE_DIR = _rnDirEnv != null
  ? file(_rnDirEnv)
  : (REACT_NATIVE_BUILD_FROM_SOURCE
  ? findProject(":packages:react-native:ReactAndroid").getProjectDir().parent
  : file(providers.exec {
      workingDir(rootDir)
      commandLine("node", "--print", "require.resolve('react-native/package.json')")
    }.standardOutput.asText.get().trim()).parent)`;
  for (const target of candidates) {
    if (!fs.existsSync(target)) continue;
    let src = fs.readFileSync(target, 'utf8');
    if (src.includes('GRADLE_PATH_RN_DIR') && src.includes('_rnDirEnv')) {
      console.error('[gradle] expo-modules-core REACT_NATIVE_DIR already patched:', target);
      continue;
    }
    if (!src.includes(needle)) {
      console.error('[gradle] expo-modules-core REACT_NATIVE_DIR needle miss:', target);
      continue;
    }
    fs.writeFileSync(target, src.replace(needle, replacement));
    console.error('[gradle] Patched expo-modules-core REACT_NATIVE_DIR → GRADLE_PATH_RN_DIR:', target);
  }
}

/** Short ASCII junction for RN (avoids ninja MAX_PATH on OneDrive Unicode realpath). */
function ensureShortReactNativeJunction() {
  if (!isWin) return null;
  const shortRoot = 'C:\\rn74';
  const folly = path.join(shortRoot, 'ReactAndroid', 'cmake-utils', 'folly-flags.cmake');
  if (fs.existsSync(folly)) return shortRoot;
  try {
    const rnPkg = require.resolve('react-native/package.json', { paths: [mobileRoot, repoRoot] });
    const rnDir = path.dirname(rnPkg);
    if (fs.existsSync(shortRoot)) {
      try {
        execSync(`rmdir "${shortRoot}"`, { shell: true, stdio: 'pipe' });
      } catch {
        /* ignore */
      }
    }
    execSync(`mklink /J "${shortRoot}" "${rnDir.replace(/"/g, '""')}"`, {
      shell: true,
      stdio: 'pipe',
    });
  } catch (e) {
    console.error('[gradle] ensureShortReactNativeJunction failed:', e && e.message ? e.message : e);
    return null;
  }
  return fs.existsSync(folly) ? shortRoot : null;
}

function patchExpoAutolinkingGradle(env) {
  const impl = env.GRADLE_PATH_EXPO_AUTOLINKING_IMPL;
  if (!impl) return;
  const stub = `// Patched by scripts/gradle.cjs (Windows junction / Unicode)
def _impl = System.getenv("GRADLE_PATH_EXPO_AUTOLINKING_IMPL")
if (_impl == null) {
  throw new GradleException("GRADLE_PATH_EXPO_AUTOLINKING_IMPL missing; run via node scripts/gradle.cjs")
}
apply from: _impl
`;
  for (const base of [mobileRoot, repoRoot]) {
    const target = path.join(base, 'node_modules', 'expo', 'scripts', 'autolinking.gradle');
    if (fs.existsSync(target)) fs.writeFileSync(target, stub);
  }
}

function applyGradlePathEnv(env) {
  const expoPkg = resolveFromMobile('expo/package.json');
  const rnPkg = require.resolve('react-native/package.json', { paths: [mobileRoot, repoRoot] });
  const rnGradle = resolveFromMobile('@react-native/gradle-plugin/package.json');
  const expoAutolinking = resolveFromMobile('expo-modules-autolinking/package.json');
  const expoCore = resolveFromMobile('expo-modules-core/package.json');
  const rnDir = path.dirname(rnPkg);
  const expoCli = resolveFromMobile('@expo/cli/build/bin/cli');

  env.GRADLE_RN_PLUGIN_ROOT = gradlePath(path.dirname(rnGradle));
  env.GRADLE_PATH_EXPO_PKG = gradlePath(expoPkg);
  env.GRADLE_PATH_RN_PKG = gradlePath(rnPkg);
  env.GRADLE_PATH_RN_PKG_METRO = gradlePath(rnPkg);
  const shortRn = ensureShortReactNativeJunction();
  env.GRADLE_PATH_RN_DIR = shortRn || gradlePath(rnDir);
  if (shortRn) {
    console.error('[gradle] GRADLE_PATH_RN_DIR short junction:', shortRn);
  }
  env.GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG = gradlePath(expoAutolinking);
  env.GRADLE_PATH_EXPO_AUTOLINKING_IMPL = gradlePath(
    path.join(path.dirname(expoAutolinking), 'scripts/android/autolinking_implementation.gradle'),
  );
  env.GRADLE_PATH_EXPO_MODULES_CORE_DIR = gradlePath(path.join(path.dirname(expoCore), 'android'));
  env.GRADLE_PATH_EXPO_CLI = gradlePath(expoCli);
  env.GRADLE_PATH_CODEGEN_DIR = gradlePath(path.dirname(resolveFromMobile('@react-native/codegen/package.json')));
  env.GRADLE_MOBILE_ROOT = gradlePath(mobileRoot);
  env.GRADLE_PATH_APP_ENTRY = path.join(env.GRADLE_MOBILE_ROOT, 'index.ts');
  const cliBin = require.resolve('@react-native-community/cli/build/bin.js', {
    paths: [rnDir, mobileRoot, repoRoot],
  });
  env.GRADLE_RN_CLI_BIN = gradlePath(cliBin);
  const cliAndroid = resolveFromMobile(
    '@react-native-community/cli-platform-android/package.json',
  );
  env.GRADLE_PATH_CLI_ANDROID_PKG = gradlePath(cliAndroid);
  const expoConstants = resolveFromMobile('expo-constants/package.json');
  /**
   * Prefer short junction symlink for createExpoConfig (cmd.exe + OneDrive Unicode
   * mojibake MODULE_NOT_FOUND). Do not realpath — keep C:\\xevn-ecosystem\\...\\expo-constants.
   */
  const expoConstantsShortCandidates = [
    path.join(mobileRoot, 'node_modules', 'expo-constants'),
    path.join(repoRoot, 'node_modules', 'expo-constants'),
    gradlePath(path.dirname(expoConstants)),
  ];
  let expoConstantsDir = expoConstantsShortCandidates.find((p) =>
    fs.existsSync(path.join(p, 'scripts', 'getAppConfig.js')),
  );
  if (!expoConstantsDir) {
    expoConstantsDir = gradlePath(path.dirname(expoConstants));
  }
  env.GRADLE_PATH_EXPO_CONSTANTS_PKG = expoConstantsDir;
  try {
    fs.writeFileSync(
      path.join(androidDir, '.expo-constants-dir'),
      expoConstantsDir,
      'utf8',
    );
  } catch {
    /* non-fatal */
  }

  const link = path.join(mobileRoot, 'android', '.rn-gradle-plugin');
  if (fs.existsSync(link)) {
    env.GRADLE_RN_PLUGIN_ROOT = path.resolve(link);
    env.GRADLE_RN_PLUGIN_REL = path.relative(execCwd, link).split(path.sep).join('/');
  }

  let realRoot = repoRoot;
  try {
    realRoot = fs.realpathSync.native(repoRoot);
  } catch {
    /* junction target */
  }

  if (substDrive) {
    env.GRADLE_REAL_REPO_ROOT = realRoot;
    env.GRADLE_SUBST_REPO_ROOT = path.resolve(`${substDrive}\\`);
    env.GRADLE_RN_PLUGIN_REL = path.relative(execCwd, env.GRADLE_RN_PLUGIN_ROOT).split(path.sep).join('/');
  } else if (useJunction) {
    env.GRADLE_REAL_REPO_ROOT = realRoot;
    env.GRADLE_SUBST_REPO_ROOT = repoRoot;
  }

  // Avoid OneDrive file locks on android build intermediates (Windows).
  const localBuildRoot =
    process.env.GRADLE_OFF_ONEDRIVE_BUILD_ROOT ||
    process.env.GRADLE_LOCAL_BUILD_ROOT ||
    (isWin ? 'C:\\xevn-android-build' : '');
  if (localBuildRoot) {
    fs.mkdirSync(localBuildRoot, { recursive: true });
    env.GRADLE_OFF_ONEDRIVE_BUILD_ROOT = localBuildRoot;
    env.GRADLE_LOCAL_BUILD_ROOT = localBuildRoot;
  }
}

function runLinkPlugin(env) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'link-rn-gradle-plugin.cjs')], {
    cwd: mobileRoot,
    env,
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const { execCwd, substDrive } = resolveExecCwd();
const gradlew = path.join(execCwd, isWin ? 'gradlew.bat' : 'gradlew');

let status = 1;
try {
  const env = { ...process.env };
  applyGradlePathEnv(env);
  patchExpoAutolinkingGradle(env);
  patchExpoAndroidBuildGradle(env);
  patchExpoModulesCoreReactNativeDir();
  runLinkPlugin(env);
  const r = spawnSync(gradlew, args, { cwd: execCwd, stdio: 'inherit', shell: isWin, env });
  status = r.status ?? 1;
} finally {
  if (substDrive) substDelete(substDrive);
}
process.exit(status);
