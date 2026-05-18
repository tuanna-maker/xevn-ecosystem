const fs = require("fs");
const path = require("path");
const mobile = path.join(__dirname, "..");
const settings = path.join(mobile, "android/settings.gradle");
let t = fs.readFileSync(settings, "utf8");
const block = `
gradle.projectsLoaded {
  def substRoot = System.getenv("GRADLE_SUBST_REPO_ROOT")
  def realRoot = System.getenv("GRADLE_REAL_REPO_ROOT")
  if (substRoot != null && realRoot != null) {
    rootProject.allprojects { prj ->
      def ap = prj.projectDir.absolutePath
      if (ap.startsWith(realRoot)) {
        def rel = ap.substring(realRoot.length())
        prj.projectDir = new File(substRoot + rel)
      }
    }
  }
}
`;
if (!t.includes("gradle.projectsLoaded")) {
  t = t.replace("include ':app'", block + "\ninclude ':app'");
  fs.writeFileSync(settings, t);
}
console.log("settings ok");
