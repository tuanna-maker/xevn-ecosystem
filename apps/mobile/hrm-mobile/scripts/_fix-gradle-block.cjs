const fs=require("fs");
const p="scripts/gradle.cjs";
let g=fs.readFileSync(p,"utf8");
const start="  env.GRADLE_RN_PLUGIN_ROOT = gradlePath(path.dirname(rnGradle);";
const end="  if (!substDrive && repoRoot === JUNCTION_REPO_ROOT) {";
const i=g.indexOf(start);
const j=g.indexOf(end);
if(i<0||j<0) throw new Error("block not found");
const block=`  env.GRADLE_RN_PLUGIN_ROOT = gradlePath(path.dirname(rnGradle));
  env.GRADLE_PATH_EXPO_PKG = gradlePath(expoPkg);
  env.GRADLE_PATH_RN_PKG = gradlePath(rnPkg);
  env.GRADLE_PATH_RN_PKG_METRO = gradlePath(rnPkg);
  env.GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG = gradlePath(expoAutolinking);
  env.GRADLE_PATH_CLI_ANDROID_PKG = gradlePath(cliAndroid);
  env.GRADLE_PATH_EXPO_MODULES_CORE_DIR = gradlePath(path.join(path.dirname(expoCore), 'android'));
  env.GRADLE_PATH_RN_DIR = gradlePath(rnDir);
  env.GRADLE_PATH_JSC_DIST = gradlePath(path.join(path.dirname(jscPkg), 'dist'));
  env.GRADLE_RN_CLI_BIN = gradlePath(cliBin);
  env.GRADLE_PATH_EXPO_CLI = gradlePath(expoCli);
  env.GRADLE_PATH_CODEGEN_DIR = gradlePath(path.dirname(codegenPkg));
  env.GRADLE_MOBILE_ROOT = gradlePath(mobileRoot);
  env.GRADLE_PATH_APP_ENTRY = gradlePath(path.join(mobileRoot, 'index.ts'));

  const localRnGradleLink = path.join(mobileRoot, 'android', '.rn-gradle-plugin');
  if (fs.existsSync(localRnGradleLink)) {
    env.GRADLE_RN_PLUGIN_ROOT = path.resolve(localRnGradleLink);
    delete env.GRADLE_RN_PLUGIN_REL;
  }

`;
g=g.slice(0,i)+block+g.slice(j);
fs.writeFileSync(p,g);
console.log("repaired applyGradlePathEnv block");
