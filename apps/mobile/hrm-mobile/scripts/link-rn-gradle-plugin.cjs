/**
 * Tạo junction/symlink `android/.rn-gradle-plugin` -> thư mục @react-native/gradle-plugin thật.
 * Gradle trên Windows thường lỗi includeBuild với đường dài pnpm + ký tự Unicode; đường tương đối
 * ngắn dưới `android/` giúp Android Studio / gradlew ổn định hơn.
 *
 * Chạy: node scripts/link-rn-gradle-plugin.cjs (hoặc pnpm run android:link-plugin)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mobileRoot = path.resolve(__dirname, '..');
const monoRoot = path.resolve(mobileRoot, '..', '..', '..');

let pluginRoot;
try {
  const rnPkg = require.resolve('react-native/package.json', { paths: [mobileRoot, monoRoot] });
  const rnDir = path.dirname(rnPkg);
  const pkg = require.resolve('@react-native/gradle-plugin/package.json', {
    paths: [rnDir],
  });
  pluginRoot = path.dirname(pkg);
} catch (e) {
  console.error(
    '[link-rn-gradle-plugin] Không resolve được @react-native/gradle-plugin. Chạy `pnpm install` từ gốc monorepo.',
  );
  process.exit(1);
}

const androidRoot = path.join(mobileRoot, 'android');
const linkPath = path.join(androidRoot, '.rn-gradle-plugin');

function removeOldLink() {
  if (!fs.existsSync(linkPath)) return;
  if (process.platform === 'win32') {
    try {
      execSync(`cmd /c if exist "${linkPath}" rmdir "${linkPath}"`, { stdio: 'inherit' });
    } catch (_) {
      try {
        fs.rmSync(linkPath, { recursive: true, force: true });
      } catch (__) {
        /* ignore */
      }
    }
  } else {
    fs.unlinkSync(linkPath);
  }
}

removeOldLink();

if (process.platform === 'win32') {
  fs.symlinkSync(path.resolve(pluginRoot), linkPath, 'junction');
} else {
  fs.symlinkSync(path.resolve(pluginRoot), linkPath, 'dir');
}

console.log('[link-rn-gradle-plugin]', linkPath, '->', pluginRoot);
