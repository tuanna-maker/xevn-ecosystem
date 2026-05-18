const fs = require("fs");
const path = require("path");

// gradle.cjs env paths
let g = fs.readFileSync("scripts/gradle.cjs", "utf8");
if (!g.includes("GRADLE_PATH_RN_DIR")) {
  g = g.replace(
    "  env.GRADLE_PATH_RN_PKG = toSubstPath(rnPkg);",
    `  env.GRADLE_PATH_RN_PKG = toSubstPath(rnPkg);
  env.GRADLE_PATH_RN_DIR = toSubstPath(path.dirname(rnPkg));
  const codegenPkg = resolveFromMobile("@react-native/codegen/package.json");
  env.GRADLE_PATH_CODEGEN_DIR = toSubstPath(path.dirname(codegenPkg));
  const jscPkg = resolveFromMobile("jsc-android/package.json");
  env.GRADLE_PATH_JSC_DIST = toSubstPath(path.join(path.dirname(jscPkg), "dist"));
  const expoCli = resolveFromMobile("@expo/cli/package.json");
  env.GRADLE_PATH_EXPO_CLI = toSubstPath(expoCli);`,
  );
  fs.writeFileSync("scripts/gradle.cjs", g);
}

function patchAppBuild() {
  let c = fs.readFileSync("android/app/build.gradle", "utf8");
  if (c.includes("gradleSubstFile")) return;
  const insert = `
def gradleSubstFile(String envKey, String nodeExpr) {
  def fromEnv = System.getenv(envKey)
  if (fromEnv != null) return new File(fromEnv)
  return new File(["node", "--print", nodeExpr].execute(null, rootDir).text.trim())
}

`;
  c = insert + c;
  c = c.replace(
    "reactNativeDir = new File([\"node\", \"--print\", \"require.resolve('react-native/package.json')\"].execute(null, rootDir).text.trim()).getParentFile().getAbsoluteFile()",
    "reactNativeDir = gradleSubstFile(\"GRADLE_PATH_RN_DIR\", \"require.resolve('react-native/package.json')\").getParentFile().getAbsoluteFile()",
  );
  c = c.replace(
    "hermesCommand = new File([\"node\", \"--print\", \"require.resolve('react-native/package.json')\"].execute(null, rootDir).text.trim()).getParentFile().getAbsolutePath() + \"/sdks/hermesc/%OS-BIN%/hermesc\"",
    "hermesCommand = gradleSubstFile(\"GRADLE_PATH_RN_DIR\", \"require.resolve('react-native/package.json')\").getParentFile().getAbsolutePath() + \"/sdks/hermesc/%OS-BIN%/hermesc\"",
  );
  c = c.replace(
    "codegenDir = new File([\"node\", \"--print\", \"require.resolve('@react-native/codegen/package.json', { paths: [require.resolve('react-native/package.json')] })\"].execute(null, rootDir).text.trim()).getParentFile().getAbsoluteFile()",
    "codegenDir = gradleSubstFile(\"GRADLE_PATH_CODEGEN_DIR\", \"require.resolve('@react-native/codegen/package.json', { paths: [require.resolve('react-native/package.json')] })\").getAbsoluteFile()",
  );
  c = c.replace(
    "cliFile = new File([\"node\", \"--print\", \"require.resolve('@expo/cli', { paths: [require.resolve('expo/package.json')] })\"].execute(null, rootDir).text.trim())",
    "cliFile = gradleSubstFile(\"GRADLE_PATH_EXPO_CLI\", \"require.resolve('@expo/cli', { paths: [require.resolve('expo/package.json')] })\")",
  );
  fs.writeFileSync("android/app/build.gradle", c);
}

function patchRootBuild() {
  let c = fs.readFileSync("android/build.gradle", "utf8");
  if (c.includes("GRADLE_PATH_RN_DIR")) return;
  c = c.replace(
    `url(new File(['node', '--print', "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim(), '../android'))`,
    `url(new File(System.getenv("GRADLE_PATH_RN_DIR") ?: ['node', '--print', "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim(), System.getenv("GRADLE_PATH_RN_DIR") ? "/android" : "../android"))`,
  );
  // Fix maven url - when env set, use GRADLE_PATH_RN_DIR + /android
  c = c.replace(
    `url(new File(System.getenv("GRADLE_PATH_RN_DIR") ?: ['node', '--print', "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim(), System.getenv("GRADLE_PATH_RN_DIR") ? "/android" : "../android"))`,
    `url(new File((System.getenv("GRADLE_PATH_RN_DIR") ? System.getenv("GRADLE_PATH_RN_DIR") + "/android" : ['node', '--print', "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim() + "/../android")))`,
  );
  c = c.replace(
    `url(new File(['node', '--print', "require.resolve('jsc-android/package.json', { paths: [require.resolve('react-native/package.json')] })"].execute(null, rootDir).text.trim(), '../dist'))`,
    `url(new File(System.getenv("GRADLE_PATH_JSC_DIST") ?: ['node', '--print', "require.resolve('jsc-android/package.json', { paths: [require.resolve('react-native/package.json')] })"].execute(null, rootDir).text.trim() + "/../dist"))`,
  );
  fs.writeFileSync("android/build.gradle", c);
}

patchAppBuild();
patchRootBuild();
console.log("patched gradle paths");
