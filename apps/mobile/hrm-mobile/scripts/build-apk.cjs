/**
 * Build APK release trên Windows (kể cả repo OneDrive / Unicode).
 * 1) Bundle JS (Metro) từ thư mục app
 * 2) Gradle assembleRelease (bỏ qua bundle nếu đã có)
 *
 * Khuyến nghị: mở repo qua junction ASCII
 *   mklink /J C:\xevn-ecosystem "<đường dẫn repo>"
 *   cd C:\xevn-ecosystem\apps\mobile\hrm-mobile && node scripts/build-apk.cjs
 */
const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const JUNCTION_REPO = 'C:\\xevn-ecosystem';
const JUNCTION_MOBILE = path.join(JUNCTION_REPO, 'apps', 'mobile', 'hrm-mobile');
const useJunction =
  fs.existsSync(path.join(JUNCTION_MOBILE, 'package.json')) &&
  fs.existsSync(path.join(JUNCTION_REPO, 'pnpm-workspace.yaml'));
const mobileRoot = useJunction ? JUNCTION_MOBILE : path.resolve(path.join(__dirname, '..'));
/** Metro: ASCII junction on Windows; realpath → OneDrive Unicode breaks pnpm/Metro resolve. */
const bundleRoot = useJunction
  ? mobileRoot
  : fs.existsSync(mobileRoot)
    ? fs.realpathSync.native(mobileRoot)
    : mobileRoot;
const androidDir = path.join(mobileRoot, 'android');
const repoRoot = useJunction ? JUNCTION_REPO : path.resolve(path.join(mobileRoot, '..', '..', '..'));
const bundleRepoRoot = useJunction
  ? JUNCTION_REPO
  : fs.existsSync(repoRoot)
    ? fs.realpathSync.native(repoRoot)
    : repoRoot;
const bundleDir = path.join(
  androidDir,
  'app/build/generated/assets/createBundleReleaseJsAndAssets',
);
const bundleFile = path.join(bundleDir, 'index.android.bundle');
const distDir = path.join(mobileRoot, 'dist');
const distApk = path.join(distDir, 'hrm-mobile-release.apk');
const distApkW7 = path.join(distDir, 'hrm-mobile-release-w7.apk');
const distApkFullstack = path.join(distDir, 'hrm-mobile-release-fullstack.apk');
const distApkQaDevice = path.join(distDir, 'hrm-mobile-qa-device.apk');

/** `release` = sponsor/pilot (email+password only). `qa-device` = adb/deep-link QA tooling. */
function resolveBuildTarget() {
  if (process.argv.includes('--qa-device')) return 'qa-device';
  const raw = (process.env.BUILD_TARGET || 'release').trim().toLowerCase();
  if (raw === 'qa-device' || raw === 'qa_device' || raw === 'qadevice') return 'qa-device';
  return 'release';
}

function resolveBundleEnvFlags(target) {
  const isQaDevice = target === 'qa-device';
  const qaDevLogin =
    process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN ??
    (isQaDevice ? '1' : '0');
  const qaDeepLink =
    process.env.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK ??
    (isQaDevice ? '1' : '0');
  return {
    EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN: qaDevLogin,
    EXPO_PUBLIC_ENABLE_QA_DEEP_LINK: qaDeepLink,
  };
}
const nativeDrawableDir = path.join(androidDir, 'app/src/main/res/drawable');
const NATIVE_DRAWABLE_KEEP = new Set(['rn_edit_text_material.xml', 'splashscreen.xml']);

function log(msg) {
  console.error(`[build-apk] ${msg}`);
}

function resolveExpoCli() {
  const candidates = ['@expo/cli/build/bin/cli', 'expo/bin/cli'];
  for (const spec of candidates) {
    try {
      return require.resolve(spec, { paths: [bundleRoot, bundleRepoRoot] });
    } catch {
      /* next */
    }
  }
  throw new Error('Không tìm thấy @expo/cli. Chạy pnpm install từ gốc monorepo.');
}

function backupNativeDrawables() {
  if (!fs.existsSync(nativeDrawableDir)) return {};
  const saved = {};
  for (const name of fs.readdirSync(nativeDrawableDir)) {
    if (!NATIVE_DRAWABLE_KEEP.has(name)) continue;
    const src = path.join(nativeDrawableDir, name);
    saved[name] = fs.readFileSync(src);
  }
  return saved;
}

function restoreNativeDrawables(saved) {
  if (!saved || !Object.keys(saved).length) return;
  fs.mkdirSync(nativeDrawableDir, { recursive: true });
  for (const [name, buf] of Object.entries(saved)) {
    fs.writeFileSync(path.join(nativeDrawableDir, name), buf);
  }
  log(`Restored native drawables: ${Object.keys(saved).join(', ')}`);
}

/** export:embed on Windows/OneDrive can drop RN assets with MAX_PATH names — breaks AAPT merge. */
function purgeLongPathDrawables() {
  const resDir = path.join(androidDir, 'app/src/main/res');
  if (!fs.existsSync(resDir)) return;
  let removed = 0;
  for (const sub of fs.readdirSync(resDir)) {
    const dir = path.join(resDir, sub);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const name of fs.readdirSync(dir)) {
      if (name.includes('____') || name.length > 120) {
        fs.unlinkSync(path.join(dir, name));
        removed += 1;
      }
    }
  }
  if (removed) log(`Purged ${removed} long-path drawable(s) from res/`);
}

function prebundle(target, bundleFlags) {
  fs.mkdirSync(bundleDir, { recursive: true });
  const expoCli = resolveExpoCli();
  const drawableBackup = backupNativeDrawables();
  const metroRoot = useJunction ? mobileRoot : bundleRoot;
  const metroRepoRoot = useJunction ? repoRoot : bundleRepoRoot;
  log(
    `Bundle JS @ ${metroRoot} → ${bundleFile} (BUILD_TARGET=${target}, QA_DEV_LOGIN=${bundleFlags.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN}, QA_DEEP_LINK=${bundleFlags.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK})`,
  );
  const r = spawnSync(
    process.execPath,
    [
      expoCli,
      'export:embed',
      '--platform',
      'android',
      '--bundle-output',
      bundleFile,
      '--entry-file',
      'index.ts',
    ],
    {
      cwd: metroRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        CI: '1',
        EXPO_PUBLIC_HRM_API_BASE_URL:
          process.env.EXPO_PUBLIC_HRM_API_BASE_URL || 'https://14-225-217-232.nip.io',
        /* Pilot release APK has no google-services.json — keep push registration off unless FCM is wired. */
        EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION:
          process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION || '0',
        EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN: bundleFlags.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN,
        EXPO_PUBLIC_ENABLE_QA_DEEP_LINK: bundleFlags.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK,
        BABEL_ENV: 'production',
        EXPO_PROJECT_ROOT: metroRoot,
        PROJECT_ROOT: metroRoot,
        NODE_PATH: [
          path.join(metroRoot, 'node_modules'),
          path.join(metroRepoRoot, 'node_modules'),
        ].join(path.delimiter),
      },
    },
  );
  if (r.status !== 0) {
    const bundleOk = fs.existsSync(bundleFile) && fs.statSync(bundleFile).size > 1_000_000;
    if (bundleOk) {
      log(
        `export:embed exit ${r.status} — continuing with bundle (${fs.statSync(bundleFile).size} B); vector font asset copy may hit MAX_PATH`,
      );
    } else {
      process.exit(r.status === null ? 1 : r.status);
    }
  }
  if (!fs.existsSync(bundleFile) || fs.statSync(bundleFile).size < 1000) {
    throw new Error(`Bundle không tạo được: ${bundleFile}`);
  }
  restoreNativeDrawables(drawableBackup);
  purgeLongPathDrawables();
  stageVectorIconFonts();
  stageReleaseBundle();
  log('Bundle OK');
}

/** Windows: hermesc under OneDrive Unicode path → spawn ENOENT; cache under junction ASCII root. */
function resolveHermescCommand() {
  const rnPkg = require.resolve('react-native/package.json', {
    paths: [bundleRoot, bundleRepoRoot],
  });
  const osBin =
    process.platform === 'win32'
      ? 'win64-bin'
      : process.platform === 'darwin'
        ? 'osx-bin'
        : 'linux64-bin';
  const hermescSrc = path.join(path.dirname(rnPkg), 'sdks/hermesc', osBin, 'hermesc.exe');
  if (process.platform !== 'win32' || !fs.existsSync(hermescSrc)) {
    return hermescSrc;
  }
  const cacheDir = path.join(mobileRoot, '.cache', 'hermesc');
  fs.mkdirSync(cacheDir, { recursive: true });
  const hermescCache = path.join(cacheDir, 'hermesc.exe');
  const srcStat = fs.statSync(hermescSrc);
  if (
    !fs.existsSync(hermescCache) ||
    fs.statSync(hermescCache).mtimeMs < srcStat.mtimeMs
  ) {
    fs.copyFileSync(hermescSrc, hermescCache);
  }
  return hermescCache;
}

function stageVectorIconFonts() {
  const roots = [bundleRoot, bundleRepoRoot];
  let ttfPath;
  try {
    ttfPath = require.resolve(
      '@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf',
      { paths: roots },
    );
  } catch {
    const local = path.join(mobileRoot, 'assets/fonts/Ionicons.ttf');
    if (fs.existsSync(local)) ttfPath = local;
  }
  if (!ttfPath || !fs.existsSync(ttfPath)) {
    log('Warning: ionicons.ttf not found — vector icon snackbar guard still applies in JS');
    return;
  }
  const fontsDir = path.join(androidDir, 'app/src/main/assets/fonts');
  fs.mkdirSync(fontsDir, { recursive: true });
  fs.copyFileSync(ttfPath, path.join(fontsDir, 'ionicons.ttf'));
  log(`Staged ionicons.ttf (${fs.statSync(ttfPath).size} bytes) → assets/fonts/`);
}

function stageReleaseBundle() {
  const assetsDir = path.join(androidDir, 'app/src/main/assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  const assetBundle = path.join(assetsDir, 'index.android.bundle');
  const hermesc = resolveHermescCommand();
  const hbcOut = path.join(bundleDir, 'index.android.bundle.hbc');
  if (process.platform === 'win32' && fs.existsSync(hermesc)) {
    log(`Hermes compile → assets (${hermesc})`);
    const hr = spawnSync(
      hermesc,
      ['-emit-binary', '-O', '-output-source-map', '-out', hbcOut, bundleFile],
      { stdio: 'inherit' },
    );
    if (hr.status === 0 && fs.existsSync(hbcOut)) {
      fs.copyFileSync(hbcOut, assetBundle);
      /* Gradle mergeReleaseAssets prefers generated/ over src/main when both exist — must overwrite plain JS. */
      fs.copyFileSync(hbcOut, bundleFile);
      for (const stray of ['index.android.bundle.hbc', 'index.android.bundle.hbc2']) {
        const p = path.join(assetsDir, stray);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      log(`Staged Hermes bundle (${fs.statSync(assetBundle).size} bytes)`);
      return;
    }
    log('Hermes compile failed — staging plain bundle');
  }
  fs.copyFileSync(bundleFile, assetBundle);
  log(`Staged JS bundle (${fs.statSync(assetBundle).size} bytes)`);
}

function runGradle(target) {
  const gradleScript = path.join(__dirname, 'gradle.cjs');
  const gradleArgs = ['assembleRelease', '--no-daemon'];
  /**
   * Keep release/qa-device builds as multi-ABI by default.
   * Forcing x86_64 drops arm64 native libs (expo-modules-core/reanimated/rnscreens)
   * and can produce physical-device white screen after splash.
   */
  const requestedArchitectures = (process.env.REACT_NATIVE_ARCHITECTURES || '').trim();
  if (requestedArchitectures) {
    gradleArgs.unshift(`-PreactNativeArchitectures=${requestedArchitectures}`);
    log(`Using explicit ABI override: ${requestedArchitectures} (BUILD_TARGET=${target})`);
  } else {
    log(`Using default ABI set from gradle.properties (BUILD_TARGET=${target})`);
  }
  /* Drop stale plain-JS intermediates so mergeReleaseAssets picks Hermes bytecode. */
  const staleAssetDirs = [
    path.join(androidDir, 'app/build/intermediates/assets/release'),
    path.join(androidDir, 'app/build/intermediates/compressed_assets/release'),
  ];
  for (const dir of staleAssetDirs) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  const r = spawnSync(process.execPath, [gradleScript, ...gradleArgs], {
    cwd: mobileRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      GRADLE_SKIP_BUNDLE_TASK: '1',
      GRADLE_USE_SUBST: process.env.GRADLE_USE_SUBST || (process.platform === 'win32' ? '1' : ''),
    },
  });
  return r.status === null ? 1 : r.status;
}

function copyApk(target) {
  const releaseDir = path.join(androidDir, 'app/build/outputs/apk/release');
  if (!fs.existsSync(releaseDir)) {
    throw new Error(`Không thấy thư mục APK: ${releaseDir}`);
  }
  const apks = fs.readdirSync(releaseDir).filter((f) => f.endsWith('.apk'));
  if (!apks.length) {
    throw new Error(`Không có file .apk trong ${releaseDir}`);
  }
  const src = path.join(releaseDir, apks[0]);
  fs.mkdirSync(distDir, { recursive: true });
  const bytes = fs.statSync(src).size;
  const mb = (bytes / (1024 * 1024)).toFixed(2);
  if (target === 'qa-device') {
    fs.copyFileSync(src, distApkQaDevice);
    log(`APK qa-device: ${distApkQaDevice} (${mb} MB, ${bytes} bytes)`);
    console.log(distApkQaDevice);
    return;
  }
  fs.copyFileSync(src, distApk);
  fs.copyFileSync(src, distApkW7);
  fs.copyFileSync(src, distApkFullstack);
  log(`APK release: ${distApk} (${mb} MB, ${bytes} bytes)`);
  log(`APK W7: ${distApkW7}`);
  log(`APK fullstack: ${distApkFullstack}`);
  console.log(distApkFullstack);
}

function main() {
  const target = resolveBuildTarget();
  const bundleFlags = resolveBundleEnvFlags(target);
  if (!process.env.ANDROID_HOME) {
    log('Cảnh báo: ANDROID_HOME chưa set (cần Android SDK)');
  }
  if (/[^\u0000-\u007f]/.test(mobileRoot) || mobileRoot.includes(' ')) {
    log(
      'Đường dẫn có Unicode/khoảng trắng. Nên build qua: mklink /J C:\\xevn-ecosystem "<repo>" rồi cd C:\\xevn-ecosystem\\apps\\mobile\\hrm-mobile',
    );
  }
  prebundle(target, bundleFlags);
  const code = runGradle(target);
  if (code !== 0) {
    process.exit(code);
  }
  copyApk(target);
}

main();
