const fs = require("fs");
let c = fs.readFileSync("android/settings.gradle", "utf8");
c = c.replace(
  "if (getRNMinorVersion() < 75) {",
  'if (getRNMinorVersion() < 75 && System.getenv("GRADLE_SUBST_REPO_ROOT") == null) {',
);
fs.writeFileSync("android/settings.gradle", c);
console.log("ok");
