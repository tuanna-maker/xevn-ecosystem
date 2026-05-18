const fs = require("fs");
let c = fs.readFileSync("android/settings.gradle", "utf8");
if (!c.includes("DBG_RN_PLUGIN")) {
  c = c.replace(
    "  includeBuild(new File(resolveNodePrint(\"require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })\")).getParentFile())",
    `  def rnGradleRoot = new File(resolveNodePrint("require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })")).getParentFile()
  println("DBG_RN_PLUGIN root=" + rnGradleRoot + " exists=" + rnGradleRoot.exists())
  includeBuild(rnGradleRoot)`
  );
  fs.writeFileSync("android/settings.gradle", c);
}
