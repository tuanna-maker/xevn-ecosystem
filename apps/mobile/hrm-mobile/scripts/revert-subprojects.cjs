const fs = require("fs");
let b = fs.readFileSync("android/build.gradle", "utf8");
const idx = b.indexOf("\nsubprojects { subproject ->");
if (idx !== -1) {
  b = b.slice(0, idx);
  fs.writeFileSync("android/build.gradle", b);
  console.log("removed subprojects block");
} else console.log("no block");
