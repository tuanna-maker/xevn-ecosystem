const fs = require("fs");
const p = "android/settings.gradle";
let c = fs.readFileSync(p, "utf8");
if (c.includes("rnGradlePluginBuildDir")) {
  console.log("already patched");
  process.exit(0);
}
const block = `def rnGradlePluginBuildDir = {
  def rnGradleLink = new File(settingsDir, ".rn-gradle-plugin")
  if (rnGradleLink.exists()) {
    return rnGradleLink
  }
  return nodeFile("require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })").getParentFile()
}()

`;
c = c.replace(
  "def nodeFile(String expr) {\n  return new File(nodePrint(expr))\n}\n\npluginManagement",
  "def nodeFile(String expr) {\n  return new File(nodePrint(expr))\n}\n\n" + block + "pluginManagement"
);
c = c.replace(
  'includeBuild(new File(rootDir, "react-settings-plugin"))',
  'includeBuild(new File(settingsDir, "react-settings-plugin"))'
);
c = c.replace(
  /  def rnGradleLink = new File\(rootDir, "\.rn-gradle-plugin"\)[\s\S]*?includeBuild\(nodeFile\([^)]+\)\.getParentFile\(\)\)\n/,
  "  includeBuild(rnGradlePluginBuildDir)\n"
);
c = c.replace(
  /includeBuild\(nodeFile\("require\.resolve\('@react-native\/gradle-plugin\/package\.json'[^)]+\)\.getParentFile\(\)\)\n$/,
  "includeBuild(rnGradlePluginBuildDir)\n"
);
fs.writeFileSync(p, c);
console.log("patched", p);
