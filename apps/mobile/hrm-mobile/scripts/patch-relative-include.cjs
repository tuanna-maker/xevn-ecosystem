const fs = require("fs");
let c = fs.readFileSync("android/settings.gradle", "utf8");
c = c.replace(
  /def rnGradleRoot = System\.getenv\("GRADLE_RN_PLUGIN_ROOT"\)[\s\S]*?includeBuild\(new File\(out\)\.getParentFile\(\)\)\s*\}/,
  `includeBuild("../../../../node_modules/.pnpm/@react-native+gradle-plugin@0.74.87/node_modules/@react-native/gradle-plugin")`
);
c = c.replace(/def rnInc = System\.getenv[\s\S]*?includeBuild\(new File\(nodePrint[\s\S]*?\)\)\s*\}/m, "");
fs.writeFileSync("android/settings.gradle", c);
console.log("patched relative includeBuild");
