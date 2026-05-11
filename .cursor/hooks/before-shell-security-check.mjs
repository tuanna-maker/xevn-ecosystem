async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

function isRisky(command) {
  const c = String(command || "").toLowerCase();
  const riskyPatterns = [
    /echo\s+.*(token|secret|password|apikey|api_key)/,
    /printenv/,
    /env$/,
    /set$/,
    /aws\s+configure/,
    /kubectl\s+create\s+secret/,
    /openssl\s+.*-pass/,
    /curl\s+.*(token|apikey|authorization)/,
    /git\s+add\s+.*\.env/,
    /type\s+.*\.env/,
    /cat\s+.*\.env/
  ];
  return riskyPatterns.some((rx) => rx.test(c));
}

async function main() {
  try {
    const payload = await readStdinJson();
    const command = String(payload.command ?? "");

    if (isRisky(command)) {
      process.stdout.write(
        JSON.stringify({
          permission: "ask",
          user_message:
            "Security hook: this command may expose secrets or sensitive configuration. Please review before running.",
          agent_message:
            "Potential secret exposure detected. Avoid printing env vars/tokens/passwords or committing .env files."
        })
      );
      return;
    }

    process.stdout.write(JSON.stringify({ permission: "allow" }));
  } catch {
    process.stdout.write(JSON.stringify({ permission: "allow" }));
  }
}

main();
