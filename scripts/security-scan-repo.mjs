import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoreDirs = new Set([".git", "node_modules", ".turbo", "dist", "build", ".next", "coverage"]);
const ignoreExt = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".lock", ".map"]);

const secretRegexes = [
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "Private key header", regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "Generic secret assignment", regex: /(secret|token|password|api[_-]?key)\s*[:=]\s*['"]?[A-Za-z0-9_\-\/+=]{12,}/gi },
  { name: "JWT token", regex: /\beyJ[A-Za-z0-9_\-]+?\.[A-Za-z0-9_\-]+?\.[A-Za-z0-9_\-]+/g }
];

const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
      continue;
    }

    const filePath = path.join(dir, entry.name);
    const rel = path.relative(root, filePath).replace(/\\/g, "/");
    const ext = path.extname(entry.name).toLowerCase();
    if (ignoreExt.has(ext)) continue;

    if (/(^|\/)\.env(\..+)?$/i.test(rel) || /credentials?|secrets?/i.test(rel)) {
      findings.push({ file: rel, reason: "Sensitive filename pattern" });
      continue;
    }

    let content = "";
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }
    for (const { name, regex } of secretRegexes) {
      regex.lastIndex = 0;
      if (regex.test(content)) findings.push({ file: rel, reason: name });
    }
  }
}

walk(root);

if (findings.length > 0) {
  console.error("Security repo scan failed. Potential secret exposure detected:");
  for (const f of findings.slice(0, 200)) console.error(`- ${f.file}: ${f.reason}`);
  process.exit(1);
}

console.log("Security repo scan passed.");
