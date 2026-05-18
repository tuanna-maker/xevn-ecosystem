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
/** Metro/pnpm: dùng đường dẫn thật (junction → OneDrive). Gradle: dùng mobileRoot (ASCII). */
const bundleRoot = fs.existsSync(mobileRoot)
  ? fs.realpathSync.native(mobileRoot)
  : mobileRoot;
const androidDir = path.join(mobileRoot, 'android');
const bundleAndroidDir = path.join(bundleRoot, 'android');
const repoRoot = useJunction ? JUNCTION_REPO : path.resolve(path.join(mobileRoot, '..', '..', '..'));
const bundleRepoRoot = fs.realpathSync.native(repoRoot);
const bundleDir = path.join(
  androidDir,
  'app/build/generated/assets/createBundleReleaseJsAndAssets',
);
const bundleFile = path.join(bundleDir, 'index.android.bundle');
const distDir = path.join(mobileRoot, 'dist');
const distApk = path.join(distDir, 'hrm-mobile-release.apk');

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

function prebundle() {
  fs.mkdirSync(bundleDir, { recursive: true });
  const expoCli = resolveExpoCli();
  const assetsDest = path.join(bundleAndroidDir, 'app/src/main/res');
  log(`Bundle JS @ ${bundleRoot} → ${bundleFile}`);
  const r = spawnSync(
    process.execPath,
    [
      expoCli,
      'export:embed',
      '--platform',
      'android',
      '--bundle-output',
      bundleFile,
      '--assets-dest',
      assetsDest,
      '--entry-file',
      'index.ts',
    ],
    {
      cwd: bundleRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        EXPO_PROJECT_ROOT: bundleRoot,
        PROJECT_ROOT: bundleRoot,
        NODE_PATH: [
          path.join(bundleRoot, 'node_modules'),
          path.join(bundleRepoRoot, 'node_modules'),
        ].join(path.delimiter),
      },
    },
  );
  if (r.status !== 0) {
    process.exit(r.status === null ? 1 : r.status);
  }
  if (!fs.existsSync(bundleFile) || fs.statSync(bundleFile).size < 1000) {
    throw new Error(`Bundle không tạo được: ${bundleFile}`);
  }
  log('Bundle OK');
}

function runGradle() {
  const gradleScript = path.join(__dirname, 'gradle.cjs');
  const r = spawnSync(process.execPath, [gradleScript, 'assembleRelease', '--no-daemon'], {
    cwd: mobileRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      GRADLE_SKIP_BUNDLE_TASK: '1',
    },
  });
  return r.status === null ? 1 : r.status;
}

function copyApk() {
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
  fs.copyFileSync(src, distApk);
  const mb = (fs.statSync(distApk).size / (1024 * 1024)).toFixed(2);
  log(`APK: ${distApk} (${mb} MB)`);
  console.log(distApk);
}

function main() {
  if (!process.env.ANDROID_HOME) {
    log('Cảnh báo: ANDROID_HOME chưa set (cần Android SDK)');
  }
  if (/[^\u0000-\u007f]/.test(mobileRoot) || mobileRoot.includes(' ')) {
    log(
      'Đường dẫn có Unicode/khoảng trắng. Nên build qua: mklink /J C:\\xevn-ecosystem "<repo>" rồi cd C:\\xevn-ecosystem\\apps\\mobile\\hrm-mobile',
    );
  }
  prebundle();
  const code = runGradle();
  if (code !== 0) {
    process.exit(code);
  }
  copyApk();
}

main();
