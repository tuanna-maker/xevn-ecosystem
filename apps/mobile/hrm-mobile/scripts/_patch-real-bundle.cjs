const fs=require("fs");
let g=fs.readFileSync("scripts/gradle.cjs","utf8");
g=g.replace("env.GRADLE_MOBILE_ROOT = toSubstPath(mobileRoot);","env.GRADLE_MOBILE_ROOT = mobileRoot;");
g=g.replace("env.GRADLE_PATH_APP_ENTRY = toSubstPath(path.join(mobileRoot, 'index.ts'));","env.GRADLE_PATH_APP_ENTRY = path.join(mobileRoot, 'index.ts');");
g=g.replace("env.GRADLE_PATH_EXPO_CLI = toSubstPath(expoCli);","env.GRADLE_PATH_EXPO_CLI = expoCli;");
g=g.replace(/const pack = toSubstPath\(mobileRoot\);[\s\S]*?env\.NODE_PATH[^\n]+\n/,"env.REACT_NATIVE_PACKAGER_ROOT = mobileRoot;\n    env.PROJECT_ROOT = mobileRoot;\n    env.EXPO_PROJECT_ROOT = mobileRoot;\n");
fs.writeFileSync("scripts/gradle.cjs",g);
let a=fs.readFileSync("android/app/build.gradle","utf8");
if(!a.includes("buildDir = new File(realRepoRoot)")){
  const block=`\ndef realRepoRoot = System.getenv("GRADLE_REAL_REPO_ROOT")\nif (realRepoRoot != null && !realRepoRoot.isEmpty()) {\n    android {\n        buildDir = new File(realRepoRoot, "apps/mobile/hrm-mobile/android/app/build")\n    }\n}\n`;
  a=a.replace('apply plugin: "com.android.application"','apply plugin: "com.android.application"'+block);
  fs.writeFileSync("android/app/build.gradle",a);
}
console.log("ok");
