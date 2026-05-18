const fs=require("fs");
const path=require("path");
const p=require.resolve("expo-modules-autolinking/package.json");
const g=path.join(path.dirname(p),"scripts/android/autolinking_implementation.gradle");
let t=fs.readFileSync(g,"utf8");
const helper = `
def mapGradleSubstPath(String p) {
  if (p == null) return p
  def realRoot = System.getenv("GRADLE_REAL_REPO_ROOT")
  def substRoot = System.getenv("GRADLE_SUBST_REPO_ROOT")
  if (realRoot == null || substRoot == null) return p
  if (p.contains(realRoot)) return p.replace(realRoot, substRoot)
  def marker = "xevn-ecosystem"
  def idx = p.toLowerCase().indexOf(marker.toLowerCase())
  if (idx < 0) return p
  def rel = p.substring(idx + marker.length())
  if (rel.startsWith(File.separator)) rel = rel.substring(File.separator.length())
  else if (rel.startsWith("/")) rel = rel.substring(1)
  return new File(substRoot, rel).absolutePath
}
`;
if (!t.includes("mapGradleSubstPath")) {
  t = t.replace("class ExpoModuleGradleProject {", helper + "\nclass ExpoModuleGradleProject {");
}
t = t.replace(
  'project(":${moduleProject.name}").projectDir = new File(moduleProject.sourceDir)',
  'project(":${moduleProject.name}").projectDir = new File(mapGradleSubstPath(moduleProject.sourceDir))'
);
t = t.replace(
  "includeBuild(new File(modulePlugin.sourceDir))",
  "includeBuild(new File(mapGradleSubstPath(modulePlugin.sourceDir)))"
);
fs.writeFileSync(g,t);
console.log("patched", g);
