const fs = require("fs");
const path = require("path");
let g = fs.readFileSync("scripts/gradle.cjs", "utf8");
if (!g.includes("GRADLE_MOBILE_ROOT")) {
  g = g.replace(
    "  env.GRADLE_PATH_EXPO_CLI = toSubstPath(expoCli);",
    `  env.GRADLE_PATH_EXPO_CLI = toSubstPath(expoCli);
  env.GRADLE_MOBILE_ROOT = toSubstPath(mobileRoot);`,
  );
  fs.writeFileSync("scripts/gradle.cjs", g);
}
let app = fs.readFileSync("android/app/build.gradle", "utf8");
if (!app.includes("GRADLE_MOBILE_ROOT")) {
  app = app.replace(
    "react {\n    entryFile",
    `react {
    if (System.getenv("GRADLE_MOBILE_ROOT") != null) {
        root = file(System.getenv("GRADLE_MOBILE_ROOT"))
    }
    entryFile`,
  );
}
if (!app.includes("xevn-hrm-app-build")) {
  app += `

if (System.getenv("GRADLE_SUBST_REPO_ROOT") != null) {
    def localBuild = new File(System.getenv("LOCALAPPDATA"), "xevn-hrm-app-build")
    buildDir = localBuild
}
`;
}
fs.writeFileSync("android/app/build.gradle", app);
console.log("patched mobile root and local buildDir");
