const fs = require("fs");
const path = require("path");
const gradlePath = path.join(__dirname, "gradle.cjs");
let c = fs.readFileSync(gradlePath, "utf8");
if (!c.includes("GRADLE_RN_PLUGIN_ROOT")) {
  const insert = `
function resolveFromMobile(specifier, pathsExtra = []) {
  const rnPkg = require.resolve("react-native/package.json", { paths: [mobileRoot, repoRoot] });
  const rnDir = path.dirname(rnPkg);
  return require.resolve(specifier, { paths: [rnDir, mobileRoot, repoRoot, ...pathsExtra] });
}

/** @param {string} absPath */
function toSubstPath(absPath) {
  if (!substDrive) return absPath;
  const substRoot = path.resolve(\`\${substDrive}\\\\\`);
  const rel = path.relative(repoRoot, absPath);
  if (rel.startsWith("..")) return absPath;
  return path.join(substRoot, rel);
}

function applyGradlePathEnv(env) {
  const expoPkg = resolveFromMobile("expo/package.json");
  const rnPkg = require.resolve("react-native/package.json", { paths: [mobileRoot, repoRoot] });
  const rnGradle = resolveFromMobile("@react-native/gradle-plugin/package.json");
  const cliAndroid = resolveFromMobile(
    "@react-native-community/cli-platform-android/package.json",
    [],
  );
  env.GRADLE_RN_PLUGIN_ROOT = toSubstPath(path.dirname(rnGradle));
  env.GRADLE_PATH_EXPO_PKG = toSubstPath(expoPkg);
  env.GRADLE_PATH_RN_PKG = toSubstPath(rnPkg);
  env.GRADLE_PATH_CLI_ANDROID_PKG = toSubstPath(cliAndroid);
}
`;
  c = c.replace(
    "function runLinkPlugin(env) {",
    insert + "\nfunction runLinkPlugin(env) {",
  );
  c = c.replace(
    "    env.GRADLE_SUBST_REPO_ROOT = substRootAbs;\n  }\n  runLinkPlugin(env);",
    "    env.GRADLE_SUBST_REPO_ROOT = substRootAbs;\n  }\n  applyGradlePathEnv(env);\n  runLinkPlugin(env);",
  );
  c = c.replace(
    "  const env = { ...process.env };\n  if (substDrive) {",
    "  const env = { ...process.env };\n  applyGradlePathEnv(env);\n  if (substDrive) {",
  );
  fs.writeFileSync(gradlePath, c);
  console.log("patched gradle.cjs");
} else console.log("gradle.cjs already patched");
