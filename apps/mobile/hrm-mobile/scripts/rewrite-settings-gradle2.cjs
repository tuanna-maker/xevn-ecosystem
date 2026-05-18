const fs = require("fs");
const p = "android/settings.gradle";
const content = `pluginManagement {
  def version = providers.exec {
    commandLine("node", "-e", "console.log(require('react-native/package.json').version);")
  }.standardOutput.asText.get().trim()
  def (_, reactNativeMinor, reactNativePatch) = version.split("-")[0].tokenize('.').collect { it.toInteger() }

  def resolveNodePrint = { String expr ->
    def out = ["node", "--print", expr].execute(null, settingsDir).text.trim()
    def realRoot = System.getenv("GRADLE_REAL_REPO_ROOT")
    def substRoot = System.getenv("GRADLE_SUBST_REPO_ROOT")
    if (realRoot != null && substRoot != null && out.contains(realRoot)) {
      return out.replace(realRoot, substRoot)
    }
    return out
  }

  includeBuild(new File(resolveNodePrint("require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })")).getParentFile())
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
      from(files(new File(nodePrint("require.resolve('react-native/package.json')"), "../gradle/libs.versions.toml")))
    }
  }
}

apply from: new File(nodePrint("require.resolve('expo/package.json')"), "../scripts/autolinking.gradle");
useExpoModules()

if (getRNMinorVersion() < 75) {
  apply from: new File(nodePrint("require.resolve('@react-native-community/cli-platform-android/package.json', { paths: [require.resolve('react-native/package.json')] })"), "../native_modules.gradle");
  applyNativeModulesSettingsGradle(settings)
}

include ':app'
includeBuild(new File(nodePrint("require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })")).getParentFile())
`;
fs.writeFileSync(p, content);
console.log("wrote", p);
