const fs = require("fs");
let g = fs.readFileSync("scripts/gradle.cjs", "utf8");
if (!g.includes("GRADLE_RN_CLI_BIN")) {
  g = g.replace(
    "  env.GRADLE_MOBILE_ROOT = toSubstPath(mobileRoot);",
    `  env.GRADLE_MOBILE_ROOT = toSubstPath(mobileRoot);
  const rnCliBin = require.resolve("@react-native-community/cli/build/bin.js", {
    paths: [path.dirname(rnPkg)],
  });
  env.GRADLE_RN_CLI_BIN = toSubstPath(rnCliBin);`,
  );
  fs.writeFileSync("scripts/gradle.cjs", g);
}
let s = fs.readFileSync("android/settings.gradle", "utf8");
s = s.replace(
  /if \(getRNMinorVersion\(\) < 75[\s\S]*?applyNativeModulesSettingsGradle\(settings\)\n\}/,
  `if (getRNMinorVersion() < 75) {
  apply from: new File(settingsDir, "custom_native_modules.gradle")
  applyNativeModulesSettingsGradle(settings)
}`,
);
fs.writeFileSync("android/settings.gradle", s);
let a = fs.readFileSync("android/app/build.gradle", "utf8");
a = a.replace(
  /if \(rnVersion < versionToNumber\(0, 75, 0\)[\s\S]*?applyNativeModulesAppBuildGradle\(project\)\n\}/,
  `if (rnVersion < versionToNumber(0, 75, 0)) {
    apply from: new File(rootDir, "custom_native_modules.gradle")
    applyNativeModulesAppBuildGradle(project)
}`,
);
fs.writeFileSync("android/app/build.gradle", a);
console.log("updated gradle env and native modules applies");
