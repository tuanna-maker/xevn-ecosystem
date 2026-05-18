const fs = require("fs");
const path = require("path");
const shortRepo = path.join("C:", "Users", "ADMIN", "OneDrive", "TAILIU~1", "Vibe Coding", "projects", "xevn-ecosystem");
const shortMobile = path.join(shortRepo, "apps", "mobile", "hrm-mobile");
let g = fs.readFileSync("scripts/gradle.cjs", "utf8");
if (!g.includes("TAILIU~1")) {
  const needle = "  if (substDrive) {";
  const insert = `  const shortRepoRoot = ${JSON.stringify(shortRepo)};
  const shortMobileRoot = ${JSON.stringify(shortMobile)};
  if (pathHasNonAscii(repoRoot)) {
    env.GRADLE_REAL_REPO_ROOT = shortRepoRoot;
    env.GRADLE_MOBILE_ROOT = shortMobileRoot;
    env.GRADLE_PATH_APP_ENTRY = path.join(shortMobileRoot, "index.ts");
    env.GRADLE_PATH_RN_PKG_METRO = require.resolve("react-native/package.json", { paths: [shortMobileRoot, shortRepoRoot] });
    env.GRADLE_PATH_EXPO_CLI = require.resolve("@expo/cli/build/bin/cli", {
      paths: [path.dirname(require.resolve("expo/package.json", { paths: [shortMobileRoot, shortRepoRoot] }))],
    });
    env.REACT_NATIVE_PACKAGER_ROOT = shortMobileRoot;
    env.PROJECT_ROOT = shortMobileRoot;
    env.EXPO_PROJECT_ROOT = shortMobileRoot;
  }
`;
  g = g.replace(needle, insert + needle);
  fs.writeFileSync("scripts/gradle.cjs", g);
}
let a = fs.readFileSync("android/app/build.gradle", "utf8");
if (!a.includes("buildDir = new File(realRepoRoot")) {
  const block = `
def realRepoRoot = System.getenv("GRADLE_REAL_REPO_ROOT")
if (realRepoRoot != null && !realRepoRoot.isEmpty()) {
    android {
        buildDir = new File(realRepoRoot, "apps/mobile/hrm-mobile/android/app/build")
    }
}
`;
  a = a.replace('apply plugin: "com.android.application"', 'apply plugin: "com.android.application"' + block);
  fs.writeFileSync("android/app/build.gradle", a);
}
console.log("patched short paths");
