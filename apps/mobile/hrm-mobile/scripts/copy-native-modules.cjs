const fs = require("fs");
const path = require("path");
const mobileRoot = path.resolve(".");
const rnPkg = require.resolve("react-native/package.json", { paths: [mobileRoot] });
const cliAndroid = require.resolve("@react-native-community/cli-platform-android/package.json", {
  paths: [path.dirname(rnPkg)],
});
const src = path.join(path.dirname(cliAndroid), "native_modules.gradle");
const dest = path.join(mobileRoot, "android", "custom_native_modules.gradle");
let c = fs.readFileSync(src, "utf8");
const needle = `    def cliResolveScript = "try {console.log(require('@react-native-community/cli').bin);} catch (e) {console.log(require('react-native/cli').bin);}"
    String[] nodeCommand = ["node", "-e", cliResolveScript]
    def cliPath = this.getCommandOutput(nodeCommand, this.root)`;
const repl = `    def cliPath = System.getenv("GRADLE_RN_CLI_BIN")
    if (cliPath == null || cliPath.isEmpty()) {
      def cliResolveScript = "try {console.log(require('@react-native-community/cli').bin);} catch (e) {console.log(require('react-native/cli').bin);}"
      String[] nodeCommand = ["node", "-e", cliResolveScript]
      cliPath = this.getCommandOutput(nodeCommand, this.root)
    }`;
if (!c.includes("GRADLE_RN_CLI_BIN")) {
  c = c.replace(needle, repl);
}
fs.writeFileSync(dest, c);
console.log("wrote", dest);
