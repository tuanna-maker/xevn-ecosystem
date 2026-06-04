import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const secretRegexes = [
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "Private key header", regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "Generic secret assignment", regex: /(secret|token|password|api[_-]?key)\s*[:=]\s*['"]?[A-Za-z0-9_\-\/+=]{10,}/gi },
  { name: "JWT token", regex: /\beyJ[A-Za-z0-9_\-]+?\.[A-Za-z0-9_\-]+?\.[A-Za-z0-9_\-]+/g }
];

const ignoreExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".pdf",
  ".lock",
  ".map"
]);

const ignoredPathRegexes = [
  /^\.cursor\//i,
  /^\.continue\//i,
  /^docs\//i,
  /^starter-kit\//i,
  /\.env\.example$/i,
  /(^|\/)\.env\.sample$/i,
  /\.spec\.(t|j)sx?$/i,
  /\.test\.(t|j)sx?$/i,
  /^apps\/api\/[^/]+\/README\.md$/i,
  /^apps\/api\/[^/]+\/src\/common\/internal-auth\.ts$/i,
  /^apps\/api\/[^/]+\/src\/common\/scope-context\.ts$/i,
  /^apps\/api\/hrm-api\/src\/hrm-admin\/hrm-admin\.service\.ts$/i,
  /^scripts\/dev\/seed-.*\.ps1$/i,
  /^apps\/mobile\/[^/]+\/src\/storage\//i,
  /^apps\/mobile\/[^/]+\/src\/context\/AuthContext\.tsx$/i,
  /^apps\/mobile\/[^/]+\/src\/features\/auth\//i,
  /^apps\/api\/[^/]+\/src\/auth\//i,
  /^apps\/web\/[^/]+\/src\/contexts\/AuthContext\.tsx$/i,
  /^apps\/web\/[^/]+\/src\/integrations\/(authSession|hrmApi|hrmMobileAuth)\.ts$/i,
  /^apps\/web\/[^/]+\/src\/modules\/hrm\/portalEmbedSessionBridge\.ts$/i,
  /^apps\/web\/hrm\/src\/components\/ai\/HRMChatWidget\.tsx$/i,
  /^packages\/platform-core\/src\/request-context\.ts$/i,
  /^scripts\/run-system-integration-uat\.mjs$/i,
  /^scripts\/seed-hrm-mobile/i,
  /^scripts\/tmp-p1-/i
];

function getStagedFiles() {
  const out = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" }).trim();
  if (!out) return [];
  return out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

function scanFile(filePath) {
  if (ignoredPathRegexes.some((regex) => regex.test(filePath))) return [];
  const ext = path.extname(filePath).toLowerCase();
  if (ignoreExtensions.has(ext)) return [];
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf8");
  const findings = [];
  for (const { name, regex } of secretRegexes) {
    regex.lastIndex = 0;
    if (regex.test(content)) findings.push(name);
  }
  return findings;
}

function main() {
  const files = getStagedFiles();
  const blocked = [];

  for (const file of files) {
    const findings = scanFile(file);
    const isEnvLike =
      ((/(^|\/)\.env(\..+)?$/i.test(file) ||
        (/credentials?|secrets?/i.test(file) && !/^docs\//i.test(file))) &&
        !/\.env\.(example|sample)$/i.test(file));
    if (isEnvLike || findings.length > 0) blocked.push({ file, findings });
  }

  if (blocked.length > 0) {
    console.error("Security pre-commit scan failed.");
    for (const item of blocked) {
      const reasons = item.findings.length > 0 ? item.findings.join(", ") : "Sensitive filename pattern";
      console.error(`- ${item.file} -> ${reasons}`);
    }
    console.error("Remove sensitive content/files from staging or move secrets to secret manager.");
    process.exit(1);
  }

  console.log("Security pre-commit scan passed.");
}

main();
