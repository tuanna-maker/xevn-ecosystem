import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

// ── Directories skipped entirely ─────────────────────────────────────────────
const ignoreDirs = new Set([
  ".git", "node_modules", ".turbo", "dist", "build", ".next", "coverage",
  ".venv",       // Python virtual env (binary files → false positives)
  ".cursor",     // Agent / team-coordination files (not production code)
  ".continue",   // AI agent config
]);

// ── Path prefix patterns skipped (relative, forward-slash) ───────────────────
const ignorePathPrefixes = [
  "docs/qa/evidence/",         // QA evidence — expired tokens from test sessions
  "docs/docs/qa/",
  "docs/ops/evidence/",        // DevOps evidence
  "apps/mobile/hrm-mobile/android/app/src/main/assets/", // compiled RN bundle
  "apps/mobile/hrm-mobile/src/storage/", // AsyncStorage key-name constants (not secrets)
];

// ── File extensions skipped ───────────────────────────────────────────────────
const ignoreExt = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".lock", ".map",
  ".exe", ".dll", ".so", ".dylib", ".bin", ".wasm",
]);

// ── Files skipped from ALL secret content scanning ───────────────────────────
// Test/spec files use fixture tokens intentionally; seed/QA scripts use dummy data.
// We trust that test fixture JWTs are not real credentials — they can't be
// verified without the signing key and are under version-control review.
const skipContentScanPatterns = [
  /\.spec\.[jt]sx?$/,
  /\.test\.[jt]sx?$/,
  /__tests__\//,
  /scripts\/dev\//,
  /scripts\/qa\//,
  /scripts\/_tmp/,
  /scripts\/tmp-/,
];

// ── Sensitive filename check ──────────────────────────────────────────────────
// Flag real .env files; allow intentional placeholders (.env.example, .env.sample, etc.)
const sensitiveFilenameRegex = /(^|\/)\.env(\.[^.]+)?$/i;
const allowedFilenameRegex = /\.(example|sample|tpl|template)$/i;

// ── Secret content patterns ───────────────────────────────────────────────────
// Generic: require QUOTED string literal to avoid camelCase function-name false positives.
// JWT: require sufficient segment length so short base64 words don't match.
const secretRegexes = [
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "Private key header", regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  {
    name: "Generic secret assignment",
    regex: /(secret|token|password|api[_-]?key)\s*[:=]\s*['"][A-Za-z0-9_\-\/+=]{12,}['"]/gi,
  },
  {
    name: "JWT token",
    regex: /\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]+/g,
  },
];

// JWT-only regex (no generic secret check)
const jwtRegex = /\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]+/g;

const findings = [];

// Only scan git-tracked files — gitignored files (e.g. local .env) are not in the repo
// and will not be present on CI runners after checkout.
let trackedFiles;
try {
  trackedFiles = new Set(
    execSync("git ls-files", { cwd: root, encoding: "utf8" })
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean)
  );
} catch {
  trackedFiles = null; // fallback: scan all (e.g. outside a git repo)
}

function shouldScan(rel) {
  return trackedFiles == null || trackedFiles.has(rel);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
      continue;
    }

    const filePath = path.join(dir, entry.name);
    const rel = path.relative(root, filePath).replace(/\\/g, "/");

    if (!shouldScan(rel)) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (ignoreExt.has(ext)) continue;
    if (ignorePathPrefixes.some((pfx) => rel.startsWith(pfx))) continue;

    // Sensitive filename — skip .env.example placeholders
    if (sensitiveFilenameRegex.test(rel) && !allowedFilenameRegex.test(entry.name)) {
      findings.push({ file: rel, reason: "Sensitive filename pattern" });
      continue;
    }

    let content = "";
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    // Test / spec / seed files — skip all content scanning
    // These legitimately contain fixture tokens and dummy credentials.
    if (skipContentScanPatterns.some((p) => p.test(rel))) continue;

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
