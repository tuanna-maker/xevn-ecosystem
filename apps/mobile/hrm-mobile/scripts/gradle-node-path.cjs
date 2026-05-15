'use strict';
/**
 * Gradle (Groovy/Java) trên Windows đôi khi không đọc được file dưới đường dẫn Unicode
 * mà Node in ra. Khi `gradle.cjs` dùng `subst`, nó set:
 *   GRADLE_REAL_REPO_ROOT = gốc monorepo (Unicode)
 *   GRADLE_SUBST_REPO_ROOT = cùng cây thư mục trên ổ subst (ví dụ Y:\)
 * Script này map đường dẫn resolve được sang ổ subst trước khi in ra cho Gradle.
 *
 * Dùng: node scripts/gradle-node-path.cjs <kind>
 * kind: expo-autolinking-impl | react-libs-versions | native-modules-settings | rn-cli-bin |
 *       react-native-android-maven | jsc-android-dist-maven | rn-gradle-include-root
 */
const fs = require('fs');
const path = require('path');

const kind = process.argv[2];
const mobileRoot = path.resolve(__dirname, '..');

function main() {
  let out;
  switch (kind) {
    case 'expo-autolinking-impl': {
      const expoPkg = require.resolve('expo/package.json', { paths: [mobileRoot] });
      const autolinkingPkg = require.resolve('expo-modules-autolinking/package.json', {
        paths: [path.dirname(expoPkg)],
      });
      out = path.join(path.dirname(autolinkingPkg), 'scripts', 'android', 'autolinking_implementation.gradle');
      break;
    }
    case 'react-libs-versions': {
      const rnPkg = require.resolve('react-native/package.json', { paths: [mobileRoot] });
      out = path.join(path.dirname(rnPkg), 'gradle', 'libs.versions.toml');
      break;
    }
    case 'native-modules-settings': {
      out = path.join(mobileRoot, 'android', 'patched-native_modules.gradle');
      break;
    }
    case 'rn-cli-bin': {
      let bin;
      try {
        bin = require('@react-native-community/cli').bin;
      } catch {
        bin = require('react-native/cli').bin;
      }
      if (typeof bin !== 'string' || !bin) {
        process.stderr.write('gradle-node-path: rn-cli-bin: missing bin\n');
        process.exit(1);
      }
      out = path.isAbsolute(bin) ? bin : path.resolve(mobileRoot, bin);
      break;
    }
    case 'react-native-android-maven': {
      const rnPkg = require.resolve('react-native/package.json', { paths: [mobileRoot] });
      out = path.join(path.dirname(rnPkg), 'android');
      break;
    }
    case 'jsc-android-dist-maven': {
      const rnPkg = require.resolve('react-native/package.json', { paths: [mobileRoot] });
      const jscPkg = require.resolve('jsc-android/package.json', { paths: [path.dirname(rnPkg)] });
      out = path.resolve(path.join(path.dirname(jscPkg), '..', 'dist'));
      break;
    }
    case 'rn-gradle-include-root': {
      const rnPkg = require.resolve('react-native/package.json', { paths: [mobileRoot] });
      const gp = require.resolve('@react-native/gradle-plugin/package.json', { paths: [path.dirname(rnPkg)] });
      out = path.dirname(gp);
      break;
    }
    default:
      process.stderr.write(`gradle-node-path: unknown kind: ${kind}\n`);
      process.exit(1);
  }
  out = mapResolvedPathForGradle(out);
  if (!fs.existsSync(out)) {
    process.stderr.write(`gradle-node-path: not found: ${out}\n`);
    process.exit(1);
  }
  process.stdout.write(out);
}

/**
 * @param {string} absPath
 * @returns {string}
 */
function mapResolvedPathForGradle(absPath) {
  const realRoot = process.env.GRADLE_REAL_REPO_ROOT;
  const substRoot = process.env.GRADLE_SUBST_REPO_ROOT;
  if (!realRoot || !substRoot) return absPath;

  const r = path.resolve(realRoot);
  const a = path.resolve(absPath);
  const rl = r.toLowerCase();
  const al = a.toLowerCase();
  if (al !== rl && !al.startsWith(rl + path.sep)) {
    return absPath;
  }
  const rel = path.relative(r, a);
  return path.resolve(substRoot, rel);
}

main();
