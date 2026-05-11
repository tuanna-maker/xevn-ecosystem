import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const hooksDir = path.join(root, ".git", "hooks");
const hookPath = path.join(hooksDir, "pre-commit");

if (!fs.existsSync(hooksDir)) {
  console.error("Cannot find .git/hooks. Run this command from repository root.");
  process.exit(1);
}

const script = `#!/usr/bin/env sh
set -e
pnpm security:scan:staged
`;

fs.writeFileSync(hookPath, script, "utf8");
try {
  fs.chmodSync(hookPath, 0o755);
} catch {
  // Best effort on Windows.
}

console.log("Installed pre-commit hook at .git/hooks/pre-commit");
