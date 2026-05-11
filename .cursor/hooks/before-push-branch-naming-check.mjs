import { execSync } from "node:child_process";

function readStdinJson() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on("data", (c) => chunks.push(c));
    process.stdin.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function getCurrentBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function isPushCommand(command) {
  const c = String(command || "").toLowerCase();
  return /\bgit\s+push\b/.test(c);
}

function isProtectedBranch(branch) {
  return /^(main|master|release\/.+)$/.test(branch);
}

function isValidWorkingBranch(branch) {
  return /^(feature|fix|chore)\/[a-z0-9._-]+$/.test(branch);
}

async function main() {
  const payload = await readStdinJson();
  const command = String(payload.command ?? "");

  if (!isPushCommand(command)) {
    process.stdout.write(JSON.stringify({ permission: "allow" }));
    return;
  }

  const branch = getCurrentBranch();
  if (!branch) {
    process.stdout.write(JSON.stringify({ permission: "allow" }));
    return;
  }

  if (isProtectedBranch(branch)) {
    process.stdout.write(JSON.stringify({ permission: "allow" }));
    return;
  }

  if (!isValidWorkingBranch(branch)) {
    process.stdout.write(
      JSON.stringify({
        permission: "ask",
        user_message:
          `Branch name "${branch}" is outside team convention. Expected: feature/<name>, fix/<name>, chore/<name>. Continue?`,
        agent_message:
          "Use standardized branch naming for traceability and consistent PR workflow."
      })
    );
    return;
  }

  process.stdout.write(JSON.stringify({ permission: "allow" }));
}

main();
