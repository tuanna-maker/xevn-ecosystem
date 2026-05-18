const fs = require("fs");
let app = fs.readFileSync("android/app/build.gradle", "utf8");
app = app.replace(/\nif \(System\.getenv\("GRADLE_SUBST_REPO_ROOT"\)[\s\S]*?buildDir = localBuild\n\}\n/, "\n");
fs.writeFileSync("android/app/build.gradle", app);
console.log("removed local buildDir override");
