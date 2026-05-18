const fs = require("fs");
const path = require("path");
const gradlePath = "scripts/gradle.cjs";
let c = fs.readFileSync(gradlePath, "utf8");
if (!c.includes("GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG")) {
  c = c.replace(
    "  env.GRADLE_PATH_CLI_ANDROID_PKG = toSubstPath(cliAndroid);",
    `  const expoAutolinking = resolveFromMobile("expo-modules-autolinking/package.json");
  env.GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG = toSubstPath(expoAutolinking);
  env.GRADLE_PATH_CLI_ANDROID_PKG = toSubstPath(cliAndroid);`,
  );
}
if (!c.includes("GRADLE_RN_PLUGIN_REL")) {
  c = c.replace(
    "  applyGradlePathEnv(env);\n  runLinkPlugin(env);",
    `  applyGradlePathEnv(env);
  if (substDrive && env.GRADLE_RN_PLUGIN_ROOT) {
    env.GRADLE_RN_PLUGIN_REL = path
      .relative(execCwd, env.GRADLE_RN_PLUGIN_ROOT)
      .split(path.sep)
      .join("/");
  }
  runLinkPlugin(env);`,
  );
}
fs.writeFileSync(gradlePath, c);

const settings = `pluginManagement {
  def version = providers.exec {
    commandLine("node", "-e", "console.log(require('react-native/package.json').version);")
  }.standardOutput.asText.get().trim()
  def (_, reactNativeMinor, reactNativePatch) = version.split("-")[0].tokenize('.').collect { it.toInteger() }

  def rnRel = System.getenv("GRADLE_RN_PLUGIN_REL")
  if (rnRel != null) {
    includeBuild(rnRel)
  } else {
    def out = ["node", "--print", "require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })"].execute(null, settingsDir).text.trim()
    includeBuild(new File(out).getParentFile())
  }
  if (reactNativeMinor == 74 && reactNativePatch <= 3) {
    includeBuild("react-settings-plugin")
  }
}

plugins { id("com.facebook.react.settings") }

def nodePrint(String expr) {
  def out = ["node", "--print", expr].execute(null, settingsDir).text.trim()
  def realRoot = System.getenv("GRADLE_REAL_REPO_ROOT")
  def substRoot = System.getenv("GRADLE_SUBST_REPO_ROOT")
  if (realRoot != null && substRoot != null && out.contains(realRoot)) {
    return out.replace(realRoot, substRoot)
  }
  return out
}

def pathFromEnv(String key, String nodeExpr) {
  def fromEnv = System.getenv(key)
  return fromEnv != null ? fromEnv : nodePrint(nodeExpr)
}

def getRNMinorVersion() {
  def version = providers.exec {
    commandLine("node", "-e", "console.log(require('react-native/package.json').version);")
  }.standardOutput.asText.get().trim()

  def coreVersion = version.split("-")[0]
  def (major, minor, patch) = coreVersion.tokenize('.').collect { it.toInteger() }

  return minor
}

if (getRNMinorVersion() >= 75) {
  extensions.configure(com.facebook.react.ReactSettingsExtension) { ex ->
    if (System.getenv('EXPO_UNSTABLE_CORE_AUTOLINKING') == '1') {
      println('\\u001B[32mUsing expo-modules-autolinking as core autolinking source\\u001B[0m')
      def command = [
        'node',
        '--no-warnings',
        '--eval',
        'require(require.resolve(\\'expo-modules-autolinking\\', { paths: [require.resolve(\\'expo/package.json\\')] }))(process.argv.slice(1))',
        'react-native-config',
        '--json',
        '--platform',
        'android'
      ].toList()
      ex.autolinkLibrariesFromCommand(command)
    } else {
      ex.autolinkLibrariesFromCommand()
    }
  }
}

rootProject.name = 'XeVN HRM'

dependencyResolutionManagement {
  versionCatalogs {
    reactAndroidLibs {
      from(files(new File(pathFromEnv("GRADLE_PATH_RN_PKG", "require.resolve('react-native/package.json')"), "../gradle/libs.versions.toml")))
    }
  }
}

def autolinkingPkg = pathFromEnv("GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG", "require.resolve('expo-modules-autolinking/package.json', { paths: [require.resolve('expo/package.json')] })")
apply from: new File(autolinkingPkg, "../scripts/android/autolinking_implementation.gradle")
useExpoModules()

if (getRNMinorVersion() < 75) {
  apply from: new File(pathFromEnv("GRADLE_PATH_CLI_ANDROID_PKG", "require.resolve('@react-native-community/cli-platform-android/package.json', { paths: [require.resolve('react-native/package.json')] })"), "../native_modules.gradle");
  applyNativeModulesSettingsGradle(settings)
}

include ':app'
def rnIncRel = System.getenv("GRADLE_RN_PLUGIN_REL")
if (rnIncRel != null) {
  includeBuild(rnIncRel)
} else {
  includeBuild(new File(nodePrint("require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })")).getParentFile())
}
`;
fs.writeFileSync("android/settings.gradle", settings);
console.log("updated gradle.cjs and settings.gradle");
