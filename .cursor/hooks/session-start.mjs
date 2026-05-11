import fs from "node:fs/promises";
import path from "node:path";

async function resolvePaths(root) {
  const teamDir = path.join(root, ".cursor", "team");
  await fs.mkdir(teamDir, { recursive: true });
  return {
    busPath: path.join(teamDir, "AGENT_MESSAGE_BUS.md")
  };
}

async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    if (raw) JSON.parse(raw);

    const now = new Date().toISOString();
    const root = process.cwd();
    const { busPath } = await resolvePaths(root);
    const entry = [
      "",
      `## ${now} | Hook sessionStart -> PM | LOW`,
      "- Topic: Session bootstrap",
      "- Work Item: TEAM-BOOTSTRAP",
      "- Request / Handoff: Session started; reminder to load queue, rules, and knowledge-base before execution.",
      "- Needed by: Immediate",
      "- Evidence: .cursor/team/AGENT_MESSAGE_BUS.md",
      "- ACK: AUTO",
      ""
    ].join("\n");

    await fs.appendFile(busPath, entry, "utf8");
    process.stdout.write(JSON.stringify({}));
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
}

main();
