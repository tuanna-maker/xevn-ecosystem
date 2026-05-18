const fs = require("fs");
const path = require("path");
let g = fs.readFileSync("scripts/gradle.cjs", "utf8");
if (!g.includes("patchExpoAutolinkingGradle")) {
  const fn = `
function patchExpoAutolinkingGradle() {
  const stub = \`// Patched for Unicode/subst (node scripts/gradle.cjs)
def _pkg = System.getenv("GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG")
if (_pkg == null) {
  throw new GradleException("GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG missing; run via node scripts/gradle.cjs")
}
apply from: new File(_pkg, "../scripts/android/autolinking_implementation.gradle")
\`;
  for (const base of [mobileRoot, repoRoot]) {
    const t = path.join(base, "node_modules", "expo", "scripts", "autolinking.gradle");
    if (fs.existsSync(t)) {
      fs.writeFileSync(t, stub);
    }
  }
}
`;
  g = g.replace("function applyGradlePathEnv(env) {", fn + "\nfunction applyGradlePathEnv(env) {");
  g = g.replace("  env.GRADLE_PATH_CLI_ANDROID_PKG = toSubstPath(cliAndroid);\n}", "  env.GRADLE_PATH_CLI_ANDROID_PKG = toSubstPath(cliAndroid);\n  patchExpoAutolinkingGradle();\n}");
  fs.writeFileSync("scripts/gradle.cjs", g);
}
let b = fs.readFileSync("android/build.gradle", "utf8");
if (!b.includes("subprojects {")) {
  b += `

subprojects { subproject ->
  afterEvaluate {
    if (subproject.plugins.hasPlugin("com.android.library") || subproject.plugins.hasPlugin("com.android.application")) {
      subproject.android {
        if (namespace == null && subproject.name == "expo") {
          compileSdk rootProject.ext.compileSdkVersion
          buildToolsVersion rootProject.ext.buildToolsVersion
        }
      }
    }
  }
}
`;
  fs.writeFileSync("android/build.gradle", b);
}
console.log("patched expo autolinking stub and subprojects");
