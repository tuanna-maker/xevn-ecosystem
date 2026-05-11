import fs from "node:fs/promises";
import path from "node:path";

function classifySeverity(exitCode) {
  if (typeof exitCode !== "number") return "LOW";
  if (exitCode === 0) return "LOW";
  if (exitCode <= 2) return "MEDIUM";
  return "HIGH";
}

async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    const payload = raw ? JSON.parse(raw) : {};

    const output = String(payload.output ?? "");
    const command = String(payload.command ?? "");
    const exitCode = Number.isFinite(payload.exit_code) ? payload.exit_code : null;
    const hasIncident = exitCode !== 0 && /(error|failed|exception|eaddrinuse|eperm|elifecycle)/i.test(output);

    if (!hasIncident) {
      process.stdout.write(JSON.stringify({}));
      return;
    }

    const now = new Date().toISOString();
    const severity = classifySeverity(exitCode ?? 1);
    const root = process.cwd();
    const teamDir = path.join(root, ".cursor", "team");
    await fs.mkdir(teamDir, { recursive: true });
    const busPath = path.join(teamDir, "AGENT_MESSAGE_BUS.md");
    const queuePath = path.join(teamDir, "PM_INCIDENT_QUEUE.json");

    const busEntry = [
      "",
      `## ${now} | Hook afterShellExecution -> PM-Tech | ${severity}`,
      "- Topic: Auto incident intake from shell",
      "- Work Item: INCIDENT-AUTO-HOOK",
      `- Request / Handoff: Command failed and matched incident pattern. Command=\`${command || "n/a"}\``,
      "- Needed by: Next orchestration cycle",
      "- Evidence: .cursor/team/PM_INCIDENT_QUEUE.json",
      "- ACK: AUTO",
      ""
    ].join("\n");
    await fs.appendFile(busPath, busEntry, "utf8");

    let incidents = [];
    try {
      incidents = JSON.parse(await fs.readFile(queuePath, "utf8"));
      if (!Array.isArray(incidents)) incidents = [];
    } catch {
      incidents = [];
    }

    incidents.push({
      id: `INC-${Date.now()}`,
      detectedAt: now,
      source: "hook:afterShellExecution",
      command,
      exitCode,
      severity,
      status: "NEW"
    });
    await fs.writeFile(queuePath, JSON.stringify(incidents, null, 2), "utf8");

    process.stdout.write(JSON.stringify({}));
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
}

main();
