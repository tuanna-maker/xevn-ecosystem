import fs from "node:fs/promises";
import path from "node:path";

function pickTemplate(text) {
  const t = text.toLowerCase();
  if (/(discovery|roadmap|product strategy|problem statement|jtbd)/.test(t)) {
    return ".cursor/templates/PRD_TEMPLATE.md";
  }
  if (/(srs|use case|business analysis|validation matrix|acceptance criteria)/.test(t)) {
    return ".cursor/templates/SRS_TEMPLATE.md";
  }
  if (/(option|trade-off|architecture decision|adr|solution design)/.test(t)) {
    return ".cursor/templates/ADR_OPTION_TEMPLATE.md";
  }
  if (/(go\/no-go|release gate|readiness|uat signoff|qc review)/.test(t)) {
    return ".cursor/templates/GO_NO_GO_TEMPLATE.md";
  }
  return null;
}

async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    const payload = raw ? JSON.parse(raw) : {};

    const text = JSON.stringify(payload);
    const template = pickTemplate(text);
    if (!template) {
      process.stdout.write(JSON.stringify({}));
      return;
    }

    const root = process.cwd();
    const teamDir = path.join(root, ".cursor", "team");
    await fs.mkdir(teamDir, { recursive: true });
    const reminderLog = path.join(teamDir, "TEMPLATE_REMINDERS.md");
    const now = new Date().toISOString();
    await fs.appendFile(
      reminderLog,
      `\n- ${now} | Suggested template: \`${template}\`\n`,
      "utf8"
    );

    process.stdout.write(
      JSON.stringify({
        additional_context: `Template reminder: use \`${template}\` for this task type.`
      })
    );
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
}

main();
