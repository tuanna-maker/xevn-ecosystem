const fs = require("fs");
const path = require("path");
const mobile = "C:/Users/ADMIN/OneDrive/TAILIU~1/Vibe Coding/projects/xevn-ecosystem/apps/mobile/hrm-mobile";
const expoAuto = path.join(mobile, "node_modules/expo/scripts/autolinking.gradle");
const expoContent = `if (!gradle.ext.has("expoAutolinkingManager")) {
  def autolinkingPkg = System.getenv("GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG")
  if (autolinkingPkg == null || autolinkingPkg.isEmpty()) {
    def autolinkingPath = ["node", "--print", "require.resolve('expo-modules-autolinking/package.json', { paths: [require.resolve('expo/package.json')] })"]
    autolinkingPkg = providers.exec {
      workingDir(rootDir)
      commandLine(autolinkingPath)
    }.standardOutput.asText.get().trim()
  }
  apply from: new File(autolinkingPkg, "../scripts/android/autolinking_implementation.gradle")
}
`;
fs.writeFileSync(expoAuto, expoContent);
const settings = path.join(mobile, "android/settings.gradle");
let t = fs.readFileSync(settings, "utf8");
const hook = `
gradle.beforeProject { project ->
  def substRoot = System.getenv("GRADLE_SUBST_REPO_ROOT")
  def realRoot = System.getenv("GRADLE_REAL_REPO_ROOT")
  if (substRoot == null || realRoot == null) {
    return
  }
  def dirPath = project.projectDir.absolutePath
  if (dirPath.startsWith(realRoot)) {
    def rel = dirPath.substring(realRoot.length())
    if (rel.startsWith(File.separator) || rel.startsWith("/") || rel.startsWith("\\\\")) {
      project.projectDir = new File(substRoot + rel)
    } else {
      project.projectDir = new File(substRoot + File.separator + rel)
    }
  }
}

`;
if (!t.includes("gradle.beforeProject")) {
  t = t.replace("useExpoModules()\n", "useExpoModules()\n" + hook);
}
if (!t.includes("custom_native_modules.gradle")) {
  t = t.replace(
    /apply from: new File\(pathFromEnv\("GRADLE_PATH_CLI_ANDROID_PKG"[\s\S]*?applyNativeModulesSettingsGradle\(settings\)/,
    'apply from: new File(settingsDir, "custom_native_modules.gradle")\n  applyNativeModulesSettingsGradle(settings)',
  );
}
fs.writeFileSync(settings, t);
console.log("ok");
