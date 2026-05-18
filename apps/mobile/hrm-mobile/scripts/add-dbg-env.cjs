const fs = require("fs");
let c = fs.readFileSync("android/settings.gradle", "utf8");
if (!c.includes("DBG_ENV_RN")) {
  c = c.replace(
    "  def rnGradleRoot = System.getenv(\"GRADLE_RN_PLUGIN_ROOT\")",
    `  def rnGradleRoot = System.getenv("GRADLE_RN_PLUGIN_ROOT")
  println("DBG_ENV_RN=" + rnGradleRoot + " exists=" + (rnGradleRoot != null ? new File(rnGradleRoot).exists() : "n/a"))`,
  );
  fs.writeFileSync("android/settings.gradle", c);
}
