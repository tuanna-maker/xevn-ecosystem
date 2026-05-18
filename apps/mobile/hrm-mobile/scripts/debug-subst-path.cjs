const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const mobileRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(mobileRoot, "..", "..", "..");
const substRoot = path.resolve("Y:\\");
const androidDir = path.join(mobileRoot, "android");
const env = { ...process.env, GRADLE_REAL_REPO_ROOT: repoRoot, GRADLE_SUBST_REPO_ROOT: substRoot };
const expr =
  "require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })";
const out = execSync(`node --print ${JSON.stringify(expr)}`, { cwd: androidDir, env }).toString().trim();
console.log("repoRoot", repoRoot);
console.log("substRoot", substRoot);
console.log("node out", out);
console.log("contains real", out.includes(repoRoot));
const fixed = out.includes(repoRoot) ? out.replace(repoRoot, substRoot) : out;
console.log("fixed", fixed);
console.log("parent exists", fs.existsSync(path.dirname(fixed)));
