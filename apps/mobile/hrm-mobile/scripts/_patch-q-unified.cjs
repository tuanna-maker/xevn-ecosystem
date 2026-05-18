const fs=require("fs");
let g=fs.readFileSync("scripts/gradle.cjs","utf8");
g=g.replace("env.GRADLE_MOBILE_ROOT = mobileRoot;","env.GRADLE_MOBILE_ROOT = toSubstPath(mobileRoot);");
g=g.replace("env.GRADLE_PATH_APP_ENTRY = path.join(mobileRoot, 'index.ts');","env.GRADLE_PATH_APP_ENTRY = toSubstPath(path.join(mobileRoot, 'index.ts'));");
g=g.replace("env.GRADLE_PATH_RN_PKG_METRO = rnPkg;","env.GRADLE_PATH_RN_PKG_METRO = toSubstPath(rnPkg);");
g=g.replace("env.GRADLE_PATH_EXPO_CLI = expoCli;","env.GRADLE_PATH_EXPO_CLI = toSubstPath(expoCli);");
g=g.replace(
  /env\.REACT_NATIVE_PACKAGER_ROOT = mobileRoot;[\s\S]*?env\.EXPO_PROJECT_ROOT = mobileRoot;/,
  "const pack = toSubstPath(mobileRoot);\n    env.REACT_NATIVE_PACKAGER_ROOT = pack;\n    env.PROJECT_ROOT = pack;\n    env.EXPO_PROJECT_ROOT = pack;"
);
fs.writeFileSync("scripts/gradle.cjs",g);
let a=fs.readFileSync("android/app/build.gradle","utf8");
a=a.replace(/\ndef realRepoRoot[\s\S]*?\n}\n/,"\n");
fs.writeFileSync("android/app/build.gradle",a);
console.log("ok");
