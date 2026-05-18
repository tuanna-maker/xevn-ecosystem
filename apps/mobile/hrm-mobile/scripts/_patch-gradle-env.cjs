const fs = require("fs");
const path = require("path");
const mobile = path.join(__dirname, "..");
const gradleCjs = path.join(__dirname, "gradle.cjs");
let c = fs.readFileSync(gradleCjs, "utf8");
if (!c.includes("patchExpoAutolinkingGradle();")) {
  c = c.replace("  applyGradlePathEnv(env);", `  applyGradlePathEnv(env);
  patchExpoAutolinkingGradle();`);
}
if (!c.includes("GRADLE_PATH_EXPO_MODULES_CORE_DIR")) {
  c = c.replace(
    "  env.GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG = toSubstPath(expoAutolinking);",
    `  const expoCore = resolveFromMobile("expo-modules-core/package.json");
  env.GRADLE_PATH_EXPO_MODULES_CORE_DIR = toSubstPath(path.join(path.dirname(expoCore), "android"));
  env.GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG = toSubstPath(expoAutolinking);`,
  );
}
fs.writeFileSync(gradleCjs, c);
const expoBuild = path.join(mobile, "node_modules/expo/android/build.gradle");
let b = fs.readFileSync(expoBuild, "utf8");
const needle = 'def expoModulesCorePlugin = new File(project(":expo-modules-core").projectDir.absolutePath, "ExpoModulesCorePlugin.gradle")';
const repl = `def _expoCoreDir = System.getenv("GRADLE_PATH_EXPO_MODULES_CORE_DIR")
def expoModulesCorePlugin = new File(_expoCoreDir != null && !_expoCoreDir.isEmpty() ? _expoCoreDir : project(":expo-modules-core").projectDir.absolutePath, "ExpoModulesCorePlugin.gradle")`;
if (b.includes(needle)) {
  b = b.replace(needle, repl);
  fs.writeFileSync(expoBuild, b);
}
console.log("gradle.cjs + expo/android patched");
