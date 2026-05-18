const fs = require("fs");
const path = require("path");
const patched = `// Patched for Unicode/subst (node scripts/gradle.cjs)
def autolinkingPkg = System.getenv("GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG")
if (autolinkingPkg != null) {
  apply from: new File(autolinkingPkg, "../scripts/android/autolinking_implementation.gradle")
} else {
  def autolinkingPath = ["node", "--print", "require.resolve('expo-modules-autolinking/package.json', { paths: [require.resolve('expo/package.json')] })"]
  apply from: new File(
    providers.exec {
      workingDir(rootDir)
      commandLine(autolinkingPath)
    }.standardOutput.asText.get().trim(),
    "../scripts/android/autolinking_implementation.gradle"
  )
}
`;
for (const base of [path.resolve("."), path.resolve("../../..")]) {
  const t = path.join(base, "node_modules", "expo", "scripts", "autolinking.gradle");
  if (fs.existsSync(t)) fs.writeFileSync(t, patched);
}
let s = fs.readFileSync("android/settings.gradle", "utf8");
s = s.replace(
  /def autolinkingPkg = pathFromEnv[\s\S]*?useExpoModules\(\)/,
  'apply from: new File(pathFromEnv("GRADLE_PATH_EXPO_PKG", "require.resolve(\'expo/package.json\')"), "../scripts/autolinking.gradle")\nuseExpoModules()',
);
fs.writeFileSync("android/settings.gradle", s);
let g = fs.readFileSync("scripts/gradle.cjs", "utf8");
g = g.replace("  patchExpoAutolinkingGradle();\n", "");
fs.writeFileSync("scripts/gradle.cjs", g);
console.log("fixed expo autolinking flow");
