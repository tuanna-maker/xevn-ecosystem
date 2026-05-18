const fs = require("fs");
let c = fs.readFileSync("android/app/build.gradle", "utf8");
const old = `if (rnVersion < versionToNumber(0, 75, 0)) {
    apply from: new File(["node", "--print", "require.resolve('@react-native-community/cli-platform-android/package.json', { paths: [require.resolve('react-native/package.json')] })"].execute(null, rootDir).text.trim(), "../native_modules.gradle");
    applyNativeModulesAppBuildGradle(project)
}`;
const neu = `if (rnVersion < versionToNumber(0, 75, 0) && System.getenv("GRADLE_SUBST_REPO_ROOT") == null) {
    apply from: new File(["node", "--print", "require.resolve('@react-native-community/cli-platform-android/package.json', { paths: [require.resolve('react-native/package.json')] })"].execute(null, rootDir).text.trim(), "../native_modules.gradle");
    applyNativeModulesAppBuildGradle(project)
}`;
if (c.includes(old)) {
  c = c.replace(old, neu);
  fs.writeFileSync("android/app/build.gradle", c);
  console.log("patched app/build.gradle");
} else if (c.includes("GRADLE_SUBST_REPO_ROOT")) {
  console.log("already patched");
} else {
  console.log("pattern not found");
}
